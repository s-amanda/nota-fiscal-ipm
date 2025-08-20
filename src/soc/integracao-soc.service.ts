import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { parse } from 'date-fns';
import path from 'path';
import * as soap from 'soap';
import { Configuration } from 'src/config';
import { TarefaEnvioSoc } from 'src/soc/entities/tarefa-envio-soc';
import { ConsultaExamePedido } from './pedido-exame.repository';

const { WSSecurity } = soap;

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formataDataBR(date: Date) {
  return (
    pad(date.getUTCDate()) +
    '/' +
    pad(date.getUTCMonth() + 1) +
    '/' +
    date.getUTCFullYear()
  );
}

function formataDataHora(date: Date) {
  return (
    date.getUTCFullYear() +
    '-' +
    pad(date.getUTCMonth() + 1) +
    '-' +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    ':' +
    pad(date.getUTCMinutes()) +
    ':' +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function getNomeArquivoSemExtensao(name: string) {
  return name.substring(0, name.lastIndexOf('.'));
}

function postProcess(xml: string) {
  const expires = formataDataHora(new Date(Date.now() + 1000 * 60));
  return xml.replace(
    /<wsu:Expires>[^>]+<\/wsu:Expires>/,
    `<wsu:Expires>${expires}</wsu:Expires>`,
  );
}

const httpClient = axios.create();

httpClient.interceptors.request.use((request) => {
  if (request.data) {
    // corrige erro da biblioteca soap
    request.data = request.data.replace(
      'Content-Transfer-Encoding: binary',
      'Content-Transfer-Encoding: base64',
    );
  }
  return request;
});

@Injectable()
export class IntegracaoSocService {
  constructor() {}

  private async novoClientSoap(
    endpoint: string,
    usuario: string,
    chaveAcesso: string,
  ) {
    const security = new WSSecurity(`U${usuario}`, chaveAcesso, {
      hasNonce: true,
      passwordType: 'PasswordDigest',
    });
    const client = await soap.createClientAsync(endpoint, {
      request: httpClient,
      overrideRootElement: {
        namespace: 'ser',
        xmlnsAttributes: [
          {
            name: 'xmlns:ser',
            value: 'http://services.soc.age.com/',
          },
          {
            name: 'xmlns:xop',
            value: 'http://www.w3.org/2004/08/xop/include',
          },
          {
            name: 'xmlns:xop-mime',
            value: 'http://www.w3.org/2005/05/xmlmime',
          },
        ],
      },
    });
    client.setSecurity(security);
    return client;
  }

  async uploadArquivo(tarefa: TarefaEnvioSoc, arquivo: Buffer) {
    const client = await this.novoClientSoap(
      'https://ws1.soc.com.br/WSSoc/services/UploadArquivosWs?wsdl',
      tarefa.codigoUsuario,
      tarefa.chaveAcesso,
    );

    const anexo = {
      mimetype: 'application/pdf',
      contentId: 'file',
      name: tarefa.nomeArquivo,
      body: arquivo.toString('base64'),
    };
    const extensaoArquivo = path.extname(anexo.name).substring(1);

    try {
      await client.uploadArquivoAsync(
        {
          arg0: {
            arquivo: {
              $xml: `<xop:Include href="cid:${anexo.contentId}"/>`,
            },
            nomeArquivo: getNomeArquivoSemExtensao(anexo.name),
            extensaoArquivo: extensaoArquivo.toUpperCase(),
            classificacao: tarefa.classificacao,
            codigoSequencialFicha: tarefa.codigoSequencialFicha,
            identificacaoVo: {
              chaveAcesso: tarefa.chaveAcesso,
              codigoEmpresaPrincipal: tarefa.codigoEmpresaPrincipal,
              codigoResponsavel: tarefa.codigoResponsavel,
              codigoUsuario: tarefa.codigoUsuario,
            },
          },
        },
        {
          attachments: [anexo],
          postProcess,
        },
      );
      return {
        requisicaoXml: client.lastRequest,
        retornoXml:
          typeof client.lastResponse === 'string'
            ? client.lastResponse
            : JSON.stringify(client.lastResponse),
      };
    } catch (error: any) {
      throw new IntegracaoSocException(
        error.message,
        client.lastRequest ?? '',
        typeof client.lastResponse === 'string'
          ? client.lastResponse
          : JSON.stringify(client.lastResponse),
      );
    }
  }

  async perencheDataResultadoExame(
    tarefa: TarefaEnvioSoc,
    exame: ConsultaExamePedido,
  ) {
    const client = await this.novoClientSoap(
      'https://ws1.soc.com.br/WSSoc/services/ResultadoExamesWs?wsdl',
      tarefa.codigoUsuario,
      tarefa.chaveAcesso,
    );

    try {
      await client.resultadoExamesPorCodigoSequencialAsync(
        {
          resultadoExame: {
            examesIdentificacaoPorIdWsVo: {
              codigoIdFicha: tarefa.codigoSequencialFicha,
              codigoIdResultadoExame: exame.sequencialResultado,
            },
            resultadoExamesDadosWsVo: {
              alteraFichaClinica: 'true',
              dataResultadoExame: formataDataBR(exame.dataLiberado),
              sobrepoeResultadoExistente: 'true',
              codigoPrestador: '94',
            },
            identificacaoWsVo: {
              chaveAcesso: tarefa.chaveAcesso,
              codigoEmpresaPrincipal: tarefa.codigoEmpresaPrincipal,
              codigoResponsavel: tarefa.codigoResponsavel,
              codigoUsuario: tarefa.codigoUsuario,
            },
          },
        },
        {
          postProcess,
        },
      );
    } catch (error: any) {
      throw new IntegracaoSocException(
        error.message,
        client.lastRequest ?? '',
        typeof client.lastResponse === 'string'
          ? client.lastResponse
          : JSON.stringify(client.lastResponse),
      );
    }
  }
}

export class IntegracaoSocException extends Error {
  constructor(
    message: string,
    public readonly requisicaoXml: string,
    public readonly retornoXml: string,
  ) {
    super(message);
  }
}
