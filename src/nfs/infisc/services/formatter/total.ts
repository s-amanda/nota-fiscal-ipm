import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from './cpf-cnpj';

export function formatTotal(notaFiscal: NotaFiscal, totalISSItens: number) {
  const documentoTomador = removeFormat(
    notaFiscal.documentoTomador || '00000000000',
  );
  //const aliquotaIss = notaFiscal.aliquotaIss ?? notaFiscal.empresa.aliquotaIss;
  let baseCalculo = 0.0;

  if (documentoTomador.length === 11 || notaFiscal.valorIss === null) {
    baseCalculo = notaFiscal.valorServico;
    //baseCalculo = totalISSItens;
  }

  //  const valorIss = baseCalculo * (aliquotaIss / 100);
  const valorIss = totalISSItens;

  const total = {
    vServ: notaFiscal.valorServico.toFixed(2),
    vDesc: 0.0,
    vtNF: notaFiscal.valorTotal.toFixed(2),
    vtLiq: notaFiscal.valorTotal.toFixed(2),
    totalAproxTrib: 0.0,
    vtLiqFaturas: notaFiscal.valorTotal.toFixed(2),
    ISS: {
      vBCISS: baseCalculo.toFixed(2),
      vISS: valorIss.toFixed(2),
    },
  };

  return total;
}
