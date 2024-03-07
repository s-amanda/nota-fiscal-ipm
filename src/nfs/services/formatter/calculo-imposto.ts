import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function calculoImposto(notaFiscal: NotaFiscal) {
  const valorImpostoFederais = (
    (notaFiscal.valorServico * 13.45) /
    100
  ).toFixed(2);
  const valorImpostoMunicipais = (
    (notaFiscal.valorServico * 2.09) /
    100
  ).toFixed(2);

  return { valorImpostoFederais, valorImpostoMunicipais };
}
