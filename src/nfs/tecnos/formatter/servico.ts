import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { formatValores } from './valor';

export function formatServico(notaFiscal: NotaFiscal) {
  const empresa = notaFiscal.empresa;

  return {
    Valores: formatValores(notaFiscal),
    IssRetido: 2, // 1 sim // 2 nao
    ResponsavelRetencao: 1, // 1 - em caso de ISS não retido // 2-Tomador
    ItemListaServico: empresa.codigoServico,
    //CodigoCnae: '0',
    CodigoTributacaoMunicipio: empresa.codigoCidade,
    Discriminacao: `${notaFiscal.obsComplementar ?? ''} \n ${notaFiscal.obsCorpo ?? ''}`,
    CodigoMunicipio: empresa.codigoCidade,
    CodigoPais: '1058',
    ExigibilidadeISS: '6', // 6-Exigibilidade Suspensa por Decisão Judicial
    MunicipioIncidencia: empresa.codigoCidade,
  };
}
