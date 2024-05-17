import axios from 'axios';
import { ClientResponse } from '../client/response';
import { NotaFiscal } from '../entities/nota-fiscal.entity';
import { MotivoCancelamento } from '../enums/motivo-cancelamento.enum';
import {
  NfseContext,
  NfseResponse,
  NfseStrategy,
} from '../services/nfse.strategy';
import { retry } from '../utils/retry';
import { NotaNaoProcessadaException } from './exceptions/nota-nao-processada';
import { formatInfoCancelamento } from './formatter/inf-pedido-cancelamento';
import { formatLoteRps } from './formatter/lote-rps';
import { formatPrestador } from './formatter/prestador';
import { TecnosClient } from './tecnos.client';

interface TecnosNfseStrategyOptions {
  endpointEnvio: string;
  endpointConsulta: string;
  endpointCancelamento: string;
  certificateFile: string;
  certificatePassword: string;
}

export class TecnosNfseStrategy implements NfseStrategy {
  private readonly client;

  constructor(private readonly options: TecnosNfseStrategyOptions) {
    this.client = new TecnosClient({
      endpointEnvio: options.endpointEnvio,
      endpointConsulta: options.endpointConsulta,
      endpointCancelamento: options.endpointCancelamento,
      certificateFile: options.certificateFile,
      certificatePassword: options.certificatePassword,
    });
  }
  async enviarNotaFiscal(
    notaFiscal: NotaFiscal,
    { codigoIbge }: NfseContext,
  ): Promise<NfseResponse> {
    const EnviarLoteRpsSincronoEnvio = {
      '@xmlns': 'http://www.abrasf.org.br/nfse.xsd',
      LoteRps: formatLoteRps(notaFiscal, codigoIbge),
    };

    const response = await this.client.enviarLoteRps({
      EnviarLoteRpsSincronoEnvio,
    });

    await this.aguardaEnvio(notaFiscal);

    return {
      id: response.data,
      protocolo: response.data,
      response,
    };
  }

  private async aguardaEnvio(notaFiscal: NotaFiscal) {
    // chama o serviço de consultar lote
    // tenta de novo enquanto ele lançar o erro NotaEmProcessamentoException
    await retry(
      () =>
        this.client.consultarNotaFiscal({
          ConsultarLoteRpsEnvio: {
            '@xmlns': 'http://www.abrasf.org.br/nfse.xsd',
            Prestador: formatPrestador(notaFiscal),
            Protocolo: notaFiscal.numeroLoteRps,
          },
        }),
      {
        retries: 10,
        shouldRetry: (error) => error instanceof NotaNaoProcessadaException,
      },
    );
  }

  async cancelarNotaFiscal(
    notaFiscal: NotaFiscal,
    motivo: MotivoCancelamento,
  ): Promise<ClientResponse<any>> {
    return this.client.cancelarNotaFiscal({
      CancelarNfseEnvio: {
        '@xmlns': 'http://www.abrasf.org.br/nfse.xsd',
        Pedido: formatInfoCancelamento(notaFiscal, motivo),
      },
    });
  }

  async gerarPdf(notaFiscal: NotaFiscal): Promise<Buffer> {
    const ConsultarLoteRpsEnvio = {
      '@xmlns': 'http://www.abrasf.org.br/nfse.xsd',
      Prestador: formatPrestador(notaFiscal),
      Protocolo: notaFiscal.numeroLoteRps,
    };

    const response = await this.client.consultarNotaFiscal({
      ConsultarLoteRpsEnvio,
    });

    const linkNota = response.data.ListaNfse.CompNfse.Nfse.InfNfse
      .LinkNota as string;
    const { data: pdf } = await axios.get<ArrayBuffer>(linkNota, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(pdf);
  }
}
