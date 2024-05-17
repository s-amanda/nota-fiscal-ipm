import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from 'src/nfs/infisc/formatter/cpf-cnpj';
import { formatValores } from './valor';

export function formatServico(notaFiscal: NotaFiscal) {
  const empresa = notaFiscal.empresa;
  const item = notaFiscal.itens[0]!;

  const documento = removeFormat(notaFiscal.documentoTomador);
  const valorIss = notaFiscal.valorIss ?? 0;
  const pjComIss = documento.length > 11 && valorIss > 0;

  return {
    Valores: formatValores(notaFiscal),
    IssRetido: pjComIss ? 1 : 2, // 1 sim // 2 nao
    ResponsavelRetencao: pjComIss ? 2 : 1, // 1 - em caso de ISS não retido // 2-Tomador
    ItemListaServico: empresa.codigoServico,
    CodigoCnae: '0',
    CodigoTributacaoMunicipio: 0,
    Discriminacao: item.descricao ?? item.servico.descricao,
    CodigoMunicipio: empresa.codigoCidade,
    CodigoPais: '1058',
    ExigibilidadeISS: '6',
    // 1-Exigível
    // 2-Não incidência
    // 3-Isenção
    // 4-Exportação
    // 5-Imunidade
    // 6-Exigibilidade Suspensa por Decisão Judicial
    // 7-Exigibilidade Suspensa por Processo Administrativo
    MunicipioIncidencia: empresa.codigoCidade,
  };
}
