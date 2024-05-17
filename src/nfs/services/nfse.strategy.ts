import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientResponse } from '../client/response';
import { NotaFiscal } from '../entities/nota-fiscal.entity';

import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import { Configuration } from 'src/config';
import { CidadeEnum } from '../enums/cidade.enum';
import { MotivoCancelamento } from '../enums/motivo-cancelamento.enum';
import { ProvedorEnum } from '../enums/provedor.enum';
import { InfiscNfseStrategy } from '../infisc/infisc.strategy';
import { TecnosNfseStrategy } from '../tecnos/tecnos.strategy';

// Informações adicionais que podem ser necessárias para a geração da nota
// Nem todo provedor precisará utilizar
export interface NfseContext {
  codigoIbge: string;
}

// Interface que descreve o retorno do provedor quando uma nota é emitida
export interface NfseResponse {
  id: string; // Id gerado pelo provedor
  protocolo: string; // Protocolo gerado pelo provedor, varia conforme o provedor (exemplo: infisc é o cLote)
  response: ClientResponse<any>;
}

// Interface que descreve os métodos que todos os provedores devem implementar
export interface NfseStrategy {
  enviarNotaFiscal(
    notaFiscal: NotaFiscal,
    context: NfseContext,
  ): Promise<NfseResponse>;

  cancelarNotaFiscal(
    notaFiscal: NotaFiscal,
    motivo: MotivoCancelamento,
  ): Promise<ClientResponse<any>>;

  gerarPdf(notaFiscal: NotaFiscal): Promise<Buffer>;
}

/*
  Classe que determina qual provedor será utilizado para cada cidade 
*/
@Injectable()
export class NfseStrategyProvider {
  /* Guarda o client do provedor de cada cidade, para não ser necessário criar um client novo toda vez */
  private clientByCidade = new Map<CidadeEnum, NfseStrategy>();

  constructor(private config: ConfigService<Configuration>) {}

  getStrategy(notaFiscal: NotaFiscal) {
    const codigoCidade = notaFiscal.empresa.codigoCidade as CidadeEnum;
    const cidadesConfig = this.config.getOrThrow('nfse', { infer: true });

    // Verifica se o código da cidade da empresa da NF está presente no objeto de configuração
    if (!(codigoCidade in cidadesConfig)) {
      throw new InternalServerErrorException(
        'Cidade não configurada para envio de nota fiscal',
      );
    }

    const cidadeConfig = cidadesConfig[codigoCidade];

    // Verifica se ainda não existe um client inicializado para a cidade
    if (!this.clientByCidade.has(codigoCidade)) {
      let strategy: NfseStrategy;

      // Inicializa o client de acordo com o "provedor" definido no objeto de configuração
      switch (cidadeConfig.provedor) {
        case ProvedorEnum.INFISC:
          strategy = new InfiscNfseStrategy({
            endpoint: cidadeConfig.endpoint,
            environment: cidadeConfig.ambiente,
            certificateFile: fs.readFileSync(
              cidadeConfig.certificate,
              'base64',
            ),
            certificatePassword: cidadeConfig.certificatePassword,
          });
          break;
        case ProvedorEnum.TECNOS:
          strategy = new TecnosNfseStrategy({
            endpointEnvio: cidadeConfig.endpointEnvio,
            endpointConsulta: cidadeConfig.endpointConsulta,
            endpointCancelamento: cidadeConfig.endpointCancelamento,
            certificateFile: fs.readFileSync(
              cidadeConfig.certificate,
              'base64',
            ),
            certificatePassword: cidadeConfig.certificatePassword,
          });
          break;
      }

      // Armazena o client para ser reutilizado nas próximas vezes
      this.clientByCidade.set(codigoCidade, strategy);
    }

    // Retorna o client já existente ou recém inicializado para a cidade
    return this.clientByCidade.get(codigoCidade)!;
  }
}
