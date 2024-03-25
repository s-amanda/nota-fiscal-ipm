import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import { Configuration } from 'src/config';
import { WritableStreamBuffer } from 'stream-buffers';
import { NotaFiscal } from '../entities/nota-fiscal.entity';
import { MotivoCancelamento } from '../enums/motivo-cancelamento.enum';
import { InfiscClient } from '../infisc.client';
import { toArray } from '../utils/array';
import { gerarChaveAcesso } from './formatter/chave-acesso';
import { removeFormat } from './formatter/cpf-cnpj';
import { formatLote } from './formatter/envio-lote';
import { HistoricoNfseService } from './historico-nfse.service';

enum CodigoSituacao {
  EM_PROCESSAMENTO = 217,
  ERRO = 200,
  SUCESSO = 100,
}

@Injectable()
export class InfiscService {
  constructor(
    private infiscClient: InfiscClient,
    private historicoNfseService: HistoricoNfseService,
  ) {}

  async enviarNotaFiscal(
    notaFiscal: NotaFiscal,
    codigoIbge: string,
    config: ConfigService<Configuration>,
  ) {
    //depois de cancelada o seq_notfis pode ser enviado novamente com outro numero de nfs-e?
    const envioLote = formatLote(notaFiscal, codigoIbge, config);

    const {
      content: { cLote: numeroLote, sit: situacao },
      xml: xmlEnvio,
    } = (await this.infiscClient.execute('enviarLoteNotas', {
      envioLote,
    })) as any;

    const chaveAcesso = gerarChaveAcesso(notaFiscal);

    //historico de envio
    await this.historicoNfseService.gravarHistorico(
      notaFiscal,
      xmlEnvio as string,
      situacao === 100, //true ou false
      String(numeroLote),
      chaveAcesso,
    );

    return await this.consultarNotaFiscal(notaFiscal, String(numeroLote));
  }

  private async consultarNotaFiscal(
    notaFiscal: NotaFiscal,
    numeroLote: string,
  ) {
    const cnpj = removeFormat(notaFiscal.empresa.cnpj);
    const chaveAcesso = gerarChaveAcesso(notaFiscal);

    const {
      content: { NFSe },
      xml: xmlConsulta,
    } = await this.getCriticaLote(cnpj, numeroLote);
    if (NFSe.sit === CodigoSituacao.ERRO) {
      await this.historicoNfseService.gravarHistorico(
        notaFiscal,
        xmlConsulta as string,
        false,
        String(numeroLote),
        chaveAcesso,
      );

      throw new BadRequestException(
        NFSe.motivos.mot,
        'Falha ao processar nota fiscal',
      );
    }
    await this.historicoNfseService.gravarHistorico(
      notaFiscal,
      xmlConsulta as string,
      true,
      String(numeroLote),
      chaveAcesso,
    );
    return NFSe as object;
  }

  private async getCriticaLote(cnpj: string, numeroLote: string) {
    // const chaveAcesso = gerarChaveAcesso(notaFiscal);
    let ultimaTentativa;

    for (let tentativa = 0; tentativa < 3; tentativa++) {
      ultimaTentativa = await this.infiscClient.execute('obterCriticaLote', {
        pedidoStatusLote: {
          '@versao': '1.0',
          CNPJ: cnpj,
          cLote: numeroLote,
        },
      });
      const {
        content: { NFSe },
      } = ultimaTentativa;
      const [validacao] = toArray(NFSe);

      if (validacao.sit !== CodigoSituacao.EM_PROCESSAMENTO) {
        return ultimaTentativa;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return ultimaTentativa!;
  }

  async cancelarNotaFiscal(notaFiscal: NotaFiscal, motivo: MotivoCancelamento) {
    const cnpj = notaFiscal.empresa.cnpj;
    const chaveAcesso = gerarChaveAcesso(notaFiscal);

    const { content } = await this.infiscClient.execute('cancelarNotaFiscal', {
      pedCancelaNFSe: {
        '@versao': '1.0',
        CNPJ: removeFormat(cnpj),
        'chvAcessoNFS-e': chaveAcesso,
        motivo: motivo === MotivoCancelamento.SERVICO_NAO_PRESTADO ? 1 : 2, // “1”: Serviço não foi prestado ou “2”: NFS-e emitida com dados incorretos
      },
    });

    if (content.sit === CodigoSituacao.ERRO) {
      throw new BadRequestException(content.mot);
    }

    return content;
  }

  async gerarPdf(notaFiscal: NotaFiscal) {
    const cnpj = notaFiscal.empresa.cnpj;
    const chaveAcesso = gerarChaveAcesso(notaFiscal);
    const {
      content: { 'NFS-ePNG': base64 },
    } = await this.infiscClient.execute('obterNotasEmPNG', {
      pedidoNFSePNG: {
        '@versao': '1.0',
        CNPJ: removeFormat(cnpj),
        'chvAcessoNFS-e': chaveAcesso,
      },
    });

    const document = new PDFDocument({ margin: 0 });
    document.image(Buffer.from(base64 as string, 'base64'), 0, 0, {
      width: document.page.width,
    });

    const stream = new WritableStreamBuffer();
    document.pipe(stream);
    document.end();
    return new Promise<Buffer>((resolve, reject) => {
      stream.once('finish', () => {
        resolve(stream.getContents() as Buffer);
      });
      stream.once('error', reject);
    });
  }
}
