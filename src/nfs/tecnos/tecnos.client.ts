import { XMLParser } from 'fast-xml-parser';
import { create } from 'xmlbuilder2';
import { ClientError, ClientResponse } from '../client/response';
import { SoapClient } from '../client/soap-client';
import { toArray } from '../utils/array';
import { getKeyFromCertificate } from '../utils/certificate';
import { signXml } from '../utils/signature';
import { NotaNaoProcessadaException } from './exceptions/nota-nao-processada';

enum CodigoSituacao {
  NAO_PROCESSADO = 2,
  ERRO = 3,
  SUCESSO = 4,
}

interface TecnosClientOptions {
  endpointEnvio: string;
  endpointConsulta: string;
  endpointCancelamento: string;
  certificateFile: string;
  certificatePassword: string;
}

interface MethodParameters {
  method: string;
  elemento: string;
  parameters: object;
  client: SoapClient;
}

export class TecnosClient {
  private readonly soapEnvio;
  private readonly soapConsulta;
  private readonly soapCancelamento;
  private readonly certificate;
  private readonly privateKey;

  constructor(options: TecnosClientOptions) {
    this.soapEnvio = new SoapClient({
      endpoint: options.endpointEnvio,
      namespace: 'soap',
      soapAction: 'http://tempuri.org/mEnvioLoteRPSSincrono',
    });

    this.soapConsulta = new SoapClient({
      endpoint: options.endpointConsulta,
      namespace: 'soap',
      soapAction: 'http://tempuri.org/mConsultaLoteRPS',
    });

    this.soapCancelamento = new SoapClient({
      endpoint: options.endpointCancelamento,
      namespace: 'soap',
      soapAction: 'http://tempuri.org/mCancelamentoNFSe',
    });

    const { cert, key } = getKeyFromCertificate(
      options.certificateFile,
      options.certificatePassword,
    );
    this.certificate = cert;
    this.privateKey = key;
  }

  async enviarLoteRps(xml: object) {
    const response = await this.execute({
      method: 'mEnvioLoteRPSSincrono',
      parameters: xml,
      elemento: 'InfDeclaracaoPrestacaoServico',
      client: this.soapEnvio,
    });

    const { ListaMensagemRetorno } = response.data;

    if (ListaMensagemRetorno) {
      const [mensagem] = toArray(ListaMensagemRetorno.MensagemRetorno);
      if (mensagem.Codigo !== 'A0000') {
        throw new ClientError(
          `${mensagem.Codigo} - ${mensagem.Mensagem} - ${mensagem.Correcao}`,
          response.rawRequest,
          response.rawResponse,
        );
      }
    }

    const { Protocolo: protocolo } = response.data;

    return new ClientResponse(
      String(protocolo),
      response.rawRequest,
      response.rawResponse,
    );
  }

  async consultarNotaFiscal(xml: object) {
    const parametersXml = create(xml).end({
      prettyPrint: false,
      headless: true,
    });

    const response = await this.soapConsulta.execute({
      [`mConsultaLoteRPS`]: {
        '@xmlns': 'http://tempuri.org/',
        remessa: parametersXml,
      },
    });

    const primeiraTag = Object.values(response.data)[0]!;
    const result = Object.values(primeiraTag as object)[0]!;

    const parser = new XMLParser({
      numberParseOptions: { eNotation: false, hex: false, leadingZeros: false },
    });
    const body = parser.parse(result as string);

    const envelopeKey = Object.keys(body as object)[1]!; //EnviarLoteRpsSincronoResposta

    const bodyObjeto = body[envelopeKey] ?? {};

    if (bodyObjeto.situacao === CodigoSituacao.NAO_PROCESSADO) {
      throw new NotaNaoProcessadaException(
        response.rawRequest,
        response.rawResponse,
      );
    }
    if (bodyObjeto.situacao === CodigoSituacao.ERRO) {
      return new ClientResponse(
        { mensagem: 'erro' },
        response.rawRequest,
        response.rawResponse,
      );
    }
    return new ClientResponse(
      bodyObjeto,
      response.rawRequest,
      response.rawResponse,
    );
  }

  async cancelarNotaFiscal(xml: object) {
    const response = await this.execute({
      method: 'mCancelamentoNFSe',
      parameters: xml,
      elemento: 'InfPedidoCancelamento',
      client: this.soapCancelamento,
    });

    console.log(JSON.stringify(response.data, null, 2));

    const codigo = response.data.MensagemRetorno?.MensagemRetorno?.Codigo;

    if (codigo === 'E0078') {
      throw new ClientError(
        'A nota fiscal já está cancelada',
        response.rawRequest,
        response.rawResponse,
      );
    }
    if (codigo !== 'A0000' && codigo !== undefined) {
      throw new ClientError(
        'Falha ao cancelar NFSe',
        response.rawRequest,
        response.rawResponse,
      );
    }

    return response;
  }

  private async execute({
    method,
    parameters,
    elemento,
    client,
  }: MethodParameters) {
    const parametersXml = create(parameters).end({
      prettyPrint: false,
      headless: true,
    });

    // const rootElement = Object.keys(parameters)[0]!;

    const signedXml = signXml({
      xml: parametersXml,
      certificate: this.certificate,
      privateKey: this.privateKey,
      signedElement: elemento,
      signatureLocation: 'after',
      isEmptyUri: false,
    });

    const response = await client.execute({
      [`${method}`]: {
        '@xmlns': 'http://tempuri.org/',
        remessa: signedXml,
      },
    });

    const primeiraTag = Object.values(response.data)[0]!;
    const result = Object.values(primeiraTag as object)[0]!;
    const parser = new XMLParser({
      numberParseOptions: { eNotation: false, hex: false, leadingZeros: false },
    });
    const body = parser.parse(result as string);

    const envelopeKey = Object.keys(body as object)[1]!; //EnviarLoteRpsSincronoResposta

    return new ClientResponse(
      body[envelopeKey] ?? {},
      response.rawRequest,
      response.rawResponse,
    );
  }
}

// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
// import { XMLParser } from 'fast-xml-parser';
// import fs from 'fs/promises';
// import { Configuration } from 'src/config';
// import { create } from 'xmlbuilder2';
// import { getKeyFromCertificate } from '../utils/certificate';
// import { signXml } from '../utils/signature';

// @Injectable()
// export class TecnosClient {
//   constructor(private readonly config: ConfigService<Configuration>) {}

//   async execute(method: string, documentData: object) {
//     //transforma o objeto para xml
//     const doc = create(documentData);
//     const xml = doc.end({ prettyPrint: false, headless: true });

//     //le o conteudo do certificado e converte para o formato aceito pela biblioteca de assinatura
//     const certificateFile = await fs.readFile(
//       'certificadosaomarcos.pfx',
//       'base64',
//     );
//     const { cert, key } = getKeyFromCertificate(certificateFile);

//     //assina o xml
//     const signed = signXml(xml, key, cert, Object.keys(documentData)[0]!);

//     //adiciona os dados no objeto com o xml completo
//     const signedXml = {
//       'soapenv:Envelope': {
//         '@xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
//         'soapenv:Body': {
//           //[method]
//           mEnvioLoteRPSSincrono: {
//             '@xmlns': 'http://tempuri.org/',
//             remessa: signed,
//           },
//         },
//       },
//     };

//     //converte o objeto com xml para xml
//     const requestXml = create(signedXml).end({ prettyPrint: true });
//     await fs.writeFile('request-TECNOS.xml', requestXml);

//     //envia o xml para consulta e retorna o campo 'data' do objeto com o resultado
//     const { data } = await axios({
//       method: 'post',
//       url: 'http://homologasmarcos.nfse-tecnos.com.br:9091/EnvioLoteRPSSincrono.asmx',
//       data: Buffer.from(requestXml),
//       headers: {
//         'Content-Type': 'text/xml; charset=utf-8',
//         SOAPAction: 'http://tempuri.org/mEnvioLoteRPSSincrono',
//       },
//     });

//     await fs.writeFile('response-TECNOS.xml', data as string);

//     //converte o valor do campo 'data' de string para xml
//     const parser = new XMLParser();
//     const envelope = parser.parse(data as string);

//     //acessa o body
//     const envelopeBody = envelope['env:Envelope']['env:Body'];

//     const envelopeKey = Object.keys(envelopeBody as object)[0]!;
//     const xmlBody = envelopeBody[envelopeKey].return;
//     const jsonBody = parser.parse(xmlBody as string);

//     const contentKey = Object.keys(jsonBody as object)[1]!;
//     const content = jsonBody[contentKey] as Record<string, any>;

//     console.log('content', content);

//     return { content, xml: data };
//   }
// }
