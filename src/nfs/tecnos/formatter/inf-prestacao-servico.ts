import format from 'date-fns/format';
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
    // "@xmlns": "http://www.abrasf.org.br/nfse.xsd/",
    Rps: formatRps(notaFiscal),
    Competencia: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    Servico: { tcDadosServico: formatServico(notaFiscal) },
    Prestador: formatPrestador(notaFiscal),
    Tomador: formatTomador(notaFiscal, codigoIbge),
    Intermediario: {
      IdentificacaoIntermediario: '',
    },
    ConstrucaoCivil: '',
    RegimeEspecialTributacao: '6',
    NaturezaOperacao: 6,
    OptanteSimplesNacional: 1,
    IncentivoFiscal: '2', //Não
    PercentualCargaTributaria: '13.45',
    ValorCargaTributaria: calculoImposto(notaFiscal).valorImpostoFederais,
    PercentualCargaTributariaMunicipal: '2.09',
    ValorCargaTributariaMunicipal:
      calculoImposto(notaFiscal).valorImpostoMunicipais,
    PercentualCargaTributariaEstadual: '0',
    ValorCargaTributariaEstadual: '0',
    SiglaUF: empresa.uf,
    IdCidade: empresa.codigoCidade,
  };
}
