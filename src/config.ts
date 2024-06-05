import { CidadeEnum } from './nfs/enums/cidade.enum';
import { NfseEnvironment } from './nfs/enums/environment.enum';
import { ProvedorEnum } from './nfs/enums/provedor.enum';

// Interface que determina as configurações necessárias para o provedor Infisc
interface InfiscConfiguration {
  provedor: ProvedorEnum.INFISC;
  certificate: string;
  certificatePassword: string;
  endpoint: string;
  ambiente: NfseEnvironment;
}

interface TecnosConfiguration {
  provedor: ProvedorEnum.TECNOS;
  certificate: string;
  certificatePassword: string;
  endpointEnvio: string;
  endpointConsulta: string;
  endpointCancelamento: string;
}

type ProvedorConfiguration = InfiscConfiguration | TecnosConfiguration;

type NfseConfiguration = Record<CidadeEnum, ProvedorConfiguration>;

function validateEnvironment(value: string | undefined) {
  switch (value) {
    case '1':
      return NfseEnvironment.PRODUCTION;
    case '2':
      return NfseEnvironment.TESTING;
    default:
      throw new Error(`Ambiente inválido: ${value}`);
  }
}

export function buildConfiguration() {
  return {
    soc: {
      enabled: !!process.env.SOC_INTEGRATION_ENDPOINT,
      endpoint: process.env.SOC_INTEGRATION_ENDPOINT,
      username: process.env.SOC_INTEGRATION_USERNAME,
      password: process.env.SOC_INTEGRATION_PASSWORD,
      accessKey: process.env.SOC_INTEGRATION_ACCESS_KEY,
      companyCode: process.env.SOC_INTEGRATION_COMPANY_CODE,
      responsibleCode: process.env.SOC_INTEGRATION_RESPONSIBLE_CODE,
      userCode: process.env.SOC_INTEGRATION_USER_CODE,
    },
    database: {
      hostname: process.env.SOC_INTEGRATION_DB_HOSTNAME,
      username: process.env.SOC_INTEGRATION_DB_USERNAME,
      password: process.env.SOC_INTEGRATION_DB_PASSWORD,
      database: process.env.SOC_INTEGRATION_DB_DATABASE,
      port: Number(process.env.SOC_INTEGRATION_DB_PORT) || 1433,
    },
    email: {
      username: process.env.EMAIL_CAXIAS_USERNAME,
      password: process.env.EMAIL_CAXIAS_PASSWORD,
      servidorSmtp: process.env.EMAIL_SERVIDOR_SMTP,
    },
    // Configuração dos provedores para cada cidade, cada provedor possui um conjunto de configurações diferentes
    nfse: {
      [CidadeEnum.CAXIAS_DO_SUL]: {
        provedor: ProvedorEnum.INFISC,
        certificate: process.env.NFSE_CAXIAS_CERTIFICATE!,
        certificatePassword: process.env.NFSE_CAXIAS_CERTIFICATE_PASSWORD!,
        endpoint: process.env.NFSE_CAXIAS_ENDPOINT!,
        ambiente: process.env.NFSE_CAXIAS_AMBIENTE
          ? validateEnvironment(process.env.NFSE_CAXIAS_AMBIENTE)
          : NfseEnvironment.TESTING,
      },
      [CidadeEnum.SAO_MARCOS]: {
        provedor: ProvedorEnum.TECNOS,
        certificate: process.env.NFSE_SAO_MARCOS_CERTIFICATE!,
        certificatePassword: process.env.NFSE_SAO_MARCOS_CERTIFICATE_PASSWORD!,
        endpointEnvio: process.env.NFSE_SAO_MARCOS_ENDPOINT_ENVIO!,
        endpointConsulta: process.env.NFSE_SAO_MARCOS_ENDPOINT_CONSULTA!,
        endpointCancelamento:
          process.env.NFSE_SAO_MARCOS_ENDPOINT_CANCELAMENTO!,
      },
      // [CidadeEnum.FARROUPILHA]: {
      //   provedor: ProvedorEnum.INFISC,
      //   certificate: process.env.NFSE_FARROUPILHA_CERTIFICATE!,
      //   certificatePassword: process.env.NFSE_FARROUPILHA_CERTIFICATE_PASSWORD!,
      //   endpoint: process.env.NFSE_FARROUPILHA_ENDPOINT!,
      //   ambiente: validateEnvironment(process.env.NFSE_FARROUPILHA_AMBIENTE),
      // },
      // [CidadeEnum.VERANOPOLIS]: {
      //   provedor: ProvedorEnum.TECNOS,
      //   certificate: process.env.NFSE_VERANOPOLIS_CERTIFICATE!,
      //   certificatePassword: process.env.NFSE_VERANOPOLIS_CERTIFICATE_PASSWORD!,
      //   endpointEnvio: process.env.NFSE_VERANOPOLIS_ENDPOINT_ENVIO!,
      //   endpointConsulta: process.env.NFSE_VERANOPOLIS_ENDPOINT_CONSULTA!,
      //   endpointCancelamento:
      //     process.env.NFSE_VERANOPOLIS_ENDPOINT_CANCELAMENTO!,
      // },
      // [CidadeEnum.NOVA_PRATA]: {
      //   provedor: ProvedorEnum.TECNOS,
      //   certificate: process.env.NFSE_NOVA_PRATA_CERTIFICATE!,
      //   certificatePassword: process.env.NFSE_NOVA_PRATA_CERTIFICATE_PASSWORD!,
      //   endpointEnvio: process.env.NFSE_NOVA_PRATA_ENDPOINT_ENVIO!,
      //   endpointConsulta: process.env.NFSE_NOVA_PRATA_ENDPOINT_CONSULTA!,
      //   endpointCancelamento:
      //     process.env.NFSE_NOVA_PRATA_ENDPOINT_CANCELAMENTO!,
      // },
      // [CidadeEnum.FLORES_DA_CUNHA]: {
      //   provedor: ProvedorEnum.TECNOS,
      //   certificate: process.env.NFSE_FLORES_DA_CUNHA_CERTIFICATE!,
      //   certificatePassword:
      //     process.env.NFSE_FLORES_DA_CUNHA_CERTIFICATE_PASSWORD!,
      //   endpointEnvio: process.env.NFSE_FLORES_DA_CUNHA_ENDPOINT_ENVIO!,
      //   endpointConsulta: process.env.NFSE_FLORES_DA_CUNHA_ENDPOINT_CONSULTA!,
      //   endpointCancelamento:
      //     process.env.NFSE_FLORES_DA_CUNHA_ENDPOINT_CANCELAMENTO!,
      // },
    } satisfies NfseConfiguration,
  };
}

export type Configuration = ReturnType<typeof buildConfiguration>;
