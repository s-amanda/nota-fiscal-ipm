//import format from 'date-fns/format';
import { format } from 'date-fns';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { calculoImposto } from 'src/nfs/infisc/formatter/calculo-imposto';
import { formatPrestador } from './prestador';
import { formatRps } from './rps';
import { formatServico } from './servico';
import { formatTomador } from './tomador';

export function formatInfoPrestacaoServico(
  notaFiscal: NotaFiscal,
  codigoIbge: string,
) {
  const empresa = notaFiscal.empresa;

  return {
    Rps: formatRps(notaFiscal),
    Competencia: format(
      notaFiscal.dataRetroativa ?? new Date(),
      "yyyy-MM-dd'T'HH:mm:ss",
    ),
    IdCidade: notaFiscal.empresa.codigoCidade,
    Servico: { tcDadosServico: formatServico(notaFiscal) },
    Prestador: formatPrestador(notaFiscal),
    Tomador: formatTomador(notaFiscal, codigoIbge),
    DataFatoGerador: format(
      notaFiscal.dataRetroativa ?? new Date(),
      "yyyy-MM-dd'T'HH:mm:ss",
    ),
    Intermediario: {},
    ConstrucaoCivil: {},
    RegimeEspecialTributacao: '6',
    NaturezaOperacao: '6',
    OptanteSimplesNacional: '1',
    IncentivoFiscal: '2', //Não
    PercentualCargaTributaria: '13.45',
    ValorCargaTributaria: calculoImposto(notaFiscal).valorImpostoFederais,
    PercentualCargaTributariaEstadual: '0',
    ValorCargaTributariaEstadual: '0',
    PercentualCargaTributariaMunicipal: '2.09',
    ValorCargaTributariaMunicipal:
      calculoImposto(notaFiscal).valorImpostoMunicipais,
    OutrasInformacoes: '',
    SiglaUF: empresa.uf,
    TipoNota: '0',
  };
}
