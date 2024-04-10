import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { formatValores } from './valor';

export function formatServico(notaFiscal: NotaFiscal) {
  return {
    tcDadosServico: {
      Valores: formatValores(notaFiscal),
      //IssRetido: '2',
      // 1 sim
      // 2 nao

      //ResponsavelRetencao: '1',
      // 1 - em caso de ISS não retido
      // 2-Tomador
      // 3-Intermediário
      ItemListaServico: '4.03',
      //COD_ITEM_SERV_NFE = 4.02
      CodigoCnae: '', //opcional CodigoCnae
      CodigoTributacaoMunicipio: notaFiscal.empresa.codigoMunicipioTributacao,

      Discriminacao: 'EXAMES LABORATORIAIS',
      CodigoMunicipio: '4319000',
      CodigoPais: '1058',
      ExigibilidadeISS: '6',
      // 1-Exigível
      // 2-Não incidência
      // 3-Isenção
      // 4-Exportação
      // 5-Imunidade
      // 6-Exigibilidade Suspensa por Decisão Judicial
      // 7-Exigibilidade Suspensa por Processo Administrativo
      MunicipioIncidencia: '4319000',
      NumeroProcesso: '',
    },
  };
}
