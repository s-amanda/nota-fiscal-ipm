import { XMLParser } from 'fast-xml-parser';
import { create } from 'xmlbuilder2';
import { ClientError, ClientResponse } from '../client/response';
import { SoapClient } from '../client/soap-client';
import { toArray } from '../utils/array';
import { getKeyFromCertificate } from '../utils/certificate';
import { signXml } from '../utils/signature';
import { NotaComCriticaException } from './exceptions/nota-com-critica';
import { NotaEmProcessamentoException } from './exceptions/nota-em-processamento';

enum CodigoSituacao {
  EM_PROCESSAMENTO = 217,
  ERRO = 200,
  SUCESSO = 100,
}

interface InfiscClientOptions {
  endpoint: string;
  certificateFile: string;
  certificatePassword: string;
}

interface MethodParameters {
  method: string;
  parameters: object;
}

/* 
  Classe responsável por se comunicar com os serviços do Infisc e fazer tratamento de erros
*/
export class InfiscClient {
  private readonly soap;
  private readonly certificate;
  private readonly privateKey;

  constructor(options: InfiscClientOptions) {
    this.soap = new SoapClient({
      endpoint: options.endpoint,
      namespace: 'env',
    });

    const { cert, key } = getKeyFromCertificate(
      options.certificateFile,
      options.certificatePassword,
    );
    this.certificate = cert;
    this.privateKey = key;
  }

  async enviarLoteNotas(xml: object) {
    const response = await this.execute({
      method: 'enviarLoteNotas',
      parameters: xml,
    });

    const { cLote: numeroLote, sit: situacao } = response.data;
    if (situacao !== CodigoSituacao.SUCESSO) {
      throw new ClientError(
        'Falha ao enviar NFSe',
        response.rawRequest,
        response.rawResponse,
      );
    }
    return new ClientResponse(
      String(numeroLote),
      response.rawRequest,
      response.rawResponse,
    );
  }

  async obterCriticaLote(xml: object) {
    const response = await this.execute({
      method: 'obterCriticaLote',
      parameters: xml,
    });
    const { NFSe } = response.data;
    if (NFSe.sit === CodigoSituacao.SUCESSO) {
      return response;
    } else if (NFSe.sit === CodigoSituacao.ERRO) {
      throw new NotaComCriticaException(
        toArray(NFSe.motivos).flatMap(({ mot }) => mot as string),
        response.rawRequest,
        response.rawResponse,
      );
    }
    throw new NotaEmProcessamentoException(
      response.rawRequest,
      response.rawRequest,
    );
  }

  async cancelarNotaFiscal(xml: object) {
    const response = await this.execute({
      method: 'cancelarNotaFiscal',
      parameters: xml,
    });
    const { sit: situacao } = response.data;
    if (situacao !== CodigoSituacao.SUCESSO) {
      throw new ClientError(
        'Falha ao cancelar NFSe',
        response.rawRequest,
        response.rawResponse,
      );
    }
    return response;
  }

  async obterNotasEmPNG(xml: object) {
    const response = await this.execute({
      method: 'obterNotasEmPNG',
      parameters: xml,
    });
    const { 'NFS-ePNG': base64 } = response.data;
    return Buffer.from(base64 as string, 'base64');
  }

  private async execute({ method, parameters }: MethodParameters) {
    //transforma o objeto para xml
    const parametersXml = create(parameters).end({
      prettyPrint: true,
      headless: true,
    });

    const rootElement = Object.keys(parameters)[0]!;
    //assina o xml
    const signedXml = signXml({
      xml: parametersXml,
      certificate: this.certificate,
      privateKey: this.privateKey,
      signedElement: rootElement,
      signatureLocation: 'append',
    });

    const response = await this.soap.execute({
      [`ns1:${method}`]: {
        '@xmlns:ns1': 'http://ws.pc.gif.com.br/',
        xml: signedXml,
      },
    });

    const { return: bodyXml } = Object.values(response.data)[0]!;
    const parser = new XMLParser();
    const body = parser.parse(bodyXml as string);

    const envelopeKey = Object.keys(body as object)[1]!;
    if (!body[envelopeKey] && body['SOAP-ENV:Envelope']) {
      // Não possui retorno comum, portanto é um erro de validação do formato do XML
      const { faultstring } =
        body['SOAP-ENV:Envelope']['SOAP-ENV:Body']['SOAP-ENV:Fault'];
      throw new ClientError(
        faultstring as string,
        response.rawRequest,
        response.rawResponse,
      );
    }
    return new ClientResponse(
      body[envelopeKey] ?? {},
      response.rawRequest,
      response.rawResponse,
    );
  }
}
