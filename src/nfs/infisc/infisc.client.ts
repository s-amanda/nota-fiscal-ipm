import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs/promises';
import { Configuration } from 'src/config';
import { create } from 'xmlbuilder2';
import { getKeyFromCertificate } from '../utils/certificate';
import { sign } from '../utils/signature';

@Injectable()
export class InfiscClient {
  constructor(private readonly config: ConfigService<Configuration>) {}

  async execute(method: string, documentData: object) {
    //transforma o objeto para xml
    const doc = create(documentData);
    const xml = doc.end({ prettyPrint: true, headless: true });

    //le o conteudo do certificado e converte para o formato aceito pela biblioteca de assinatura
    // const certificateFile = await fs.readFile('certificadoalfa.pfx', 'base64');
    // const { cert, key } = getKeyFromCertificate(certificateFile);
    const certificate = this.config.getOrThrow('nfse.caxias.certificate', {
      infer: true,
    });
    const certificateFile = await fs.readFile(certificate, 'base64');
    const { cert, key } = getKeyFromCertificate(certificateFile);

    //assina o xml
    const signed = sign(xml, key, cert, Object.keys(documentData)[0]!);

    //adiciona os dados no objeto com o xml completo
    const signedXml = {
      'soapenv:Envelope': {
        '@xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
        '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'soapenv:Body': {
          [`ns1:${method}`]: {
            '@soapenv:encodingStyle':
              'http://schemas.xmlsoap.org/soap/encoding/',
            '@xmlns:ns1': 'http://ws.pc.gif.com.br/',
            xml: signed,
          },
        },
      },
    };

    //converte o objeto com xml para xml
    const requestXml = create(signedXml).end({ prettyPrint: true });
    if (method === 'enviarLoteNotas')
      await fs.writeFile('request.xml', requestXml);

    //envia o xml para consulta e retorna o campo 'data' do objeto com o resultado
    const { data } = await axios({
      method: 'post',
      url: this.config.getOrThrow('nfse.caxias.endpoint', {
        infer: true,
      }),
      data: Buffer.from(requestXml),
      headers: { 'Content-Type': false },
    });

    await fs.writeFile('response.xml', data as string);
    //converte o valor do campo 'data' de string para xml
    const parser = new XMLParser();
    const envelope = parser.parse(data as string);

    //acessa o body
    const envelopeBody = envelope['env:Envelope']['env:Body'];

    const envelopeKey = Object.keys(envelopeBody as object)[0]!;
    const xmlBody = envelopeBody[envelopeKey].return;
    const jsonBody = parser.parse(xmlBody as string);

    const contentKey = Object.keys(jsonBody as object)[1]!;
    const content = jsonBody[contentKey] as Record<string, any>;

    console.log('content', content);

    return { content, xml: data };
  }
}
