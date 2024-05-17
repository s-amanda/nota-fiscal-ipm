import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from 'src/nfs/infisc/formatter/cpf-cnpj';
import { formatInfoPrestacaoServico } from './inf-prestacao-servico';

export function formatLoteRps(notaFiscal: NotaFiscal, codigoIbge: string) {
  const empresa = notaFiscal.empresa;

  return {
    '@versao': '20.01',
    '@Id': notaFiscal.numero,
    NumeroLote: notaFiscal.numero,
    CpfCnpj: {
      Cnpj: removeFormat(empresa.cnpj),
    },
    InscricaoMunicipal: empresa.inscricaoMunicipal,
    QuantidadeRps: 1,
    ListaRps: {
      Rps: {
        tcDeclaracaoPrestacaoServico: {
          InfDeclaracaoPrestacaoServico: formatInfoPrestacaoServico(
            notaFiscal,
            codigoIbge,
          ),
        },
      },
    },
  };
}
