import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatValorImposto(notaFiscal: NotaFiscal) {
  const valorImpostoFederais = (
    (notaFiscal.valorServico * 13.45) /
    100
  ).toFixed(2);
  const valorImpostoMunicipais = (
    (notaFiscal.valorServico * 2.09) /
    100
  ).toFixed(2);

  return `Valor Aproximado de Tributos: Federais: R$ ${valorImpostoFederais} (13,45%) Municipais: R$ ${valorImpostoMunicipais} (2,09%) - Fonte: IBPT/FECOMERCIO RS`;
}
