import { ClientError, ClientResponse } from '../client/response';
import { NotaFiscal } from '../entities/nota-fiscal.entity';
import { NfseEnvironment } from '../enums/environment.enum';
import { MotivoCancelamento } from '../enums/motivo-cancelamento.enum';
import {
  NfseContext,
  NfseResponse,
  NfseStrategy,
} from '../services/nfse.strategy';
import { imageToPdf } from '../utils/pdf';
import { retry } from '../utils/retry';
import { NotaEmProcessamentoException } from './exceptions/nota-em-processamento';
import { gerarChaveAcesso } from './formatter/chave-acesso';
import { removeFormat } from './formatter/cpf-cnpj';
import { formatLote } from './formatter/envio-lote';
import { InfiscClient } from './infisc.client';

interface InfiscNfseStrategyOptions {
  endpoint: string;
  certificateFile: string;
  certificatePassword: string;
  environment: NfseEnvironment;
}

/* 
  Classe responsável pela estratégia de geração de notas no Infisc,
  utiliza o InfiscClient e adiciona lógicas de negócio em cima, como o retry para esperar a nota ser processada.
*/
export class InfiscNfseStrategy implements NfseStrategy {
  private readonly client;

  constructor(private readonly options: InfiscNfseStrategyOptions) {
    this.client = new InfiscClient({
      endpoint: options.endpoint,
      certificateFile: options.certificateFile,
      certificatePassword: options.certificatePassword,
    });
  }

  async enviarNotaFiscal(
    notaFiscal: NotaFiscal,
    { codigoIbge }: NfseContext,
  ): Promise<NfseResponse> {
    const envioLote = formatLote(
      notaFiscal,
      codigoIbge,
      this.options.environment,
    );

    const response = await this.client.enviarLoteNotas({ envioLote });
    const numeroLote = response.data;

    // a nota não é processada imediatamente, portanto devemos esperar o envio ser processado
    await this.aguardaEnvio(notaFiscal, numeroLote, response);

    return {
      id: gerarChaveAcesso(notaFiscal),
      protocolo: numeroLote,
      response: response,
    };
  }

  private async aguardaEnvio(
    notaFiscal: NotaFiscal,
    numeroLote: string,
    responseEnvio: ClientResponse<any>,
  ) {
    const cnpj = removeFormat(notaFiscal.empresa.cnpj);

    try {
      // chama o serviço de obterCriticaLote
      // tenta de novo enquanto ele lançar o erro NotaEmProcessamentoException
      await retry(
        () =>
          this.client.obterCriticaLote({
            pedidoStatusLote: {
              '@versao': '1.0',
              CNPJ: cnpj,
              cLote: numeroLote,
            },
          }),
        {
          retries: 10,
          shouldRetry: (error) => error instanceof NotaEmProcessamentoException,
        },
      );
    } catch (error) {
      if (error instanceof ClientError) {
        // ajusta o erro para substituir o xml do request do obterCriticaLote pelo xml do request do enviarLoteNotas
        // dessa forma o xml do request da nota vai ser gravado no histórico, em vez do request do obterCriticaLote (que não é muito útil)
        throw new ClientError(
          error.message,
          responseEnvio.rawRequest,
          error.rawResponse,
        );
      }
      throw error;
    }
  }

  async cancelarNotaFiscal(
    notaFiscal: NotaFiscal,
    motivo: MotivoCancelamento,
  ): Promise<ClientResponse<any>> {
    const cnpj = notaFiscal.empresa.cnpj;
    const chaveAcesso = gerarChaveAcesso(notaFiscal);
    return this.client.cancelarNotaFiscal({
      pedCancelaNFSe: {
        '@versao': '1.0',
        CNPJ: removeFormat(cnpj),
        'chvAcessoNFS-e': chaveAcesso,
        motivo: motivo === MotivoCancelamento.SERVICO_NAO_PRESTADO ? 1 : 2, // “1”: Serviço não foi prestado ou “2”: NFS-e emitida com dados incorretos
      },
    });
  }

  async gerarPdf(notaFiscal: NotaFiscal): Promise<Buffer> {
    const cnpj = notaFiscal.empresa.cnpj;
    const chaveAcesso = gerarChaveAcesso(notaFiscal);

    const pngBuffer = await this.client.obterNotasEmPNG({
      pedidoNFSePNG: {
        '@versao': '1.0',
        CNPJ: removeFormat(cnpj),
        'chvAcessoNFS-e': chaveAcesso,
      },
    });

    return imageToPdf(pngBuffer);
  }
}
