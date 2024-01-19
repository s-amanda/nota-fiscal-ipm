import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import * as soap from 'soap';
import { Configuration } from 'src/config';
import { FileRequest } from 'src/soc/models/request';

const { WSSecurity } = soap;

function formatDate(date: Date) {
  function pad(n: number) {
    return n.toString().padStart(2, '0');
  }
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

export function getFileNameWithoutExtension(name: string) {
  return name.substring(0, name.lastIndexOf('.'));
}

@Injectable()
export class SocIntegrationService {
  constructor(private readonly config: ConfigService<Configuration>) {}

  private async createClient() {
    const endpoint = this.config.getOrThrow('soc.endpoint', { infer: true });
    const username = this.config.getOrThrow('soc.username', { infer: true });
    const password = this.config.getOrThrow('soc.password', { infer: true });

    const security = new WSSecurity(username, password, {
      hasNonce: true,
      passwordType: 'PasswordDigest',
    });
    const client = await soap.createClientAsync(endpoint, {
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

  async sendFile({ file, classification, sequenceNumber }: FileRequest) {
    const chaveAcesso = this.config.getOrThrow('soc.accessKey', {
      infer: true,
    });
    const codigoEmpresaPrincipal = this.config.getOrThrow('soc.companyCode', {
      infer: true,
    });
    const codigoResponsavel = this.config.getOrThrow('soc.responsibleCode', {
      infer: true,
    });
    const codigoUsuario = this.config.getOrThrow('soc.userCode', {
      infer: true,
    });
    const client = await this.createClient();

    const attachment = {
      mimetype: file.type,
      contentId: 'file',
      name: file.name,
      body: file.content.toString('binary'),
    };
    const fileExtension = path.extname(attachment.name).substring(1);

    await client.uploadArquivoAsync(
      {
        arg0: {
          arquivo: {
            $xml: `<xop:Include href="cid:${attachment.contentId}"/>`,
          },
          nomeArquivo: getFileNameWithoutExtension(attachment.name),
          extensaoArquivo: fileExtension.toUpperCase(),
          classificacao: classification,
          codigoSequencialFicha: sequenceNumber,
          identificacaoVo: {
            chaveAcesso,
            codigoEmpresaPrincipal,
            codigoResponsavel,
            codigoUsuario,
          },
        },
      },
      {
        attachments: [attachment],
        postProcess: (xml: string) => {
          const expires = formatDate(new Date(Date.now() + 1000 * 60));
          return xml.replace(
            /<wsu:Expires>[^>]+<\/wsu:Expires>/,
            `<wsu:Expires>${expires}</wsu:Expires>`,
          );
        },
      },
    );
    console.log(client.lastRequest);
  }
}
