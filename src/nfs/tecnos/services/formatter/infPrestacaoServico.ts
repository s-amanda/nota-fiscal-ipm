import format from 'date-fns/format';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { formatPrestador } from './prestador';
import { formatRps } from './rps';
import { formatServico } from './servico';
import { formatTomador } from './tomador';

export function formatInfDecPrestacaoServico(
  notaFiscal: NotaFiscal,
  codigoIbge: string,
) {
  const empresa = notaFiscal.empresa;

  return {
    // "@xmlns": "http://www.abrasf.org.br/nfse.xsd/",
    '@Id': 'R12024886592890001040000000000000001',
    Rps: formatRps(notaFiscal),
    Competencia: format(new Date(), 'yyyy-MM-ddTHH:mm:ss'),
    Servico: formatServico(notaFiscal),
    Prestador: formatPrestador(notaFiscal),
    Tomador: formatTomador(notaFiscal, codigoIbge),
    Intermediario: {
      IdentificacaoIntermediario: '',
    },
    ConstrucaoCivil: '',
    RegimeEspecialTributacao: '6', //REVISAR
    NaturezaOperacao: notaFiscal.naturezaOperacao
      ? notaFiscal.naturezaOperacao
      : empresa.naturezaOperacao,
    OptanteSimplesNacional: empresa.simplesNacional === 'S' ? 1 : 2,
    IncentivoFiscal: '2', //Não

    //PercentualCargaTributaria: '13.45',
    ValorCargaTributaria: '0.95',
    PercentualCargaTributariaMunicipal: '2.09',
    ValorCargaTributariaMunicipal: '0.15',
    PercentualCargaTributariaEstadual: '0',
    ValorCargaTributariaEstadual: '0',
    OutrasInformacoes: 'Pagamento a Vista',
    TipoNota: '0',
    SiglaUF: 'RS',
    IdCidade: '4319000',
    EspecieDocumento: '0',
    SerieTalonario: '0',
    FormaPagamento: '1',
    NumeroParcelas: '0',
  };
}
