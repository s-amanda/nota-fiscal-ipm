import axios, { isAxiosError } from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { create } from 'xmlbuilder2';
import { ClientError, ClientResponse } from './response';

interface SoapClientOptions {
  endpoint: string;
  namespace: string;
  soapAction?: string;
}

export class SoapClient {
  constructor(private readonly options: SoapClientOptions) {}

  async execute(requestBody: object) {
    const { namespace, endpoint, soapAction } = this.options;

    //adiciona os dados no objeto com o xml completo
    const xml = {
      [`${namespace}:Envelope`]: {
        [`@xmlns:${namespace}`]: 'http://schemas.xmlsoap.org/soap/envelope/',
        '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        [`${namespace}:Body`]: requestBody,
      },
    };

    //converte o objeto com xml para xml
    const requestXml = create(xml).end();

    console.log(endpoint);

    try {
      //envia o xml para consulta e retorna o campo 'data' do objeto com o resultado
      const { data } = await axios({
        method: 'post',
        url: endpoint,
        data: Buffer.from(requestXml),
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: soapAction,
        },
      });

      //converte o valor do campo 'data' de string para xml
      const parser = new XMLParser();
      const envelope = parser.parse(data as string);

      //acessa o body
      const body = envelope[`${namespace}:Envelope`][`${namespace}:Body`];
      return new ClientResponse(body as object, requestXml, data as string);
    } catch (error) {
      console.log(error);
      let rawResponse = '';
      if (isAxiosError(error)) {
        rawResponse = String(error.response?.data);
      }
      throw new ClientError(
        'Falha de comunicação SOAP',
        requestXml,
        rawResponse,
      );
    }
  }
}
