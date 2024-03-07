import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs/promises';
import { create } from 'xmlbuilder2';
import { HistoricoNfseService } from './services/historico-nfse.service';
import { getKeyFromCertificate } from './utils/certificate';
import { sign } from './utils/signature';

@Injectable()
export class InfiscClient {
  constructor(private historicoNfseService: HistoricoNfseService) {}

  async execute(method: string, documentData: object) {
    //transforma o objeto para xml
    const doc = create(documentData);
    const xml = doc.end({ prettyPrint: true, headless: true });

    //le o conteudo do certificado e converte para o formato aceito pela biblioteca de assinatura
    const certificateFile = await fs.readFile('certificadoalfa.pfx', 'base64');
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
      url: 'https://nfsehomol.caxias.rs.gov.br/portal/Servicos',
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
