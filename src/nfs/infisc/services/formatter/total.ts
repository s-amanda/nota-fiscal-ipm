import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from './cpf-cnpj';

export function formatTotal(notaFiscal: NotaFiscal, itens: Array<any>) {
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
  //const valorIss = totalISSItens;

  let totalISSItens = 0;
  let totalVRetIr = 0;
  let totalVRetPISPASEP = 0;
  let totalVRetCOFINS = 0;
  let totalVRetCSLL = 0;

  itens.forEach((item) => {
    const servico = item.serv;

    totalISSItens = totalISSItens + Number(servico.vISS);
    totalVRetIr = totalVRetIr + Number(servico.vRetIR);
    totalVRetPISPASEP = totalVRetPISPASEP + Number(servico.vRetPISPASEP);
    totalVRetCOFINS = totalVRetIr + Number(servico.vRetCOFINS);
    totalVRetCSLL = totalVRetIr + Number(servico.vRetCSLL);
  });

  const total = {
    vServ: notaFiscal.valorServico.toFixed(2),
    vDesc: '0.00',
    vtNF: notaFiscal.valorServico.toFixed(2),
    vtLiq: notaFiscal.valorTotalLiquido.toFixed(2),
    totalAproxTrib: '0.00',
    Ret: {
      vRetIR: totalVRetIr.toFixed(2),
      vRetPISPASEP: totalVRetPISPASEP.toFixed(2),
      vRetCOFINS: totalVRetCOFINS.toFixed(2),
      vRetCSLL: totalVRetCSLL.toFixed(2),
      vRetINSS: '0.00',
    },
    vtLiqFaturas: notaFiscal.valorTotalLiquido.toFixed(2),
    ISS: {
      vBCISS: baseCalculo.toFixed(2),
      vISS: totalISSItens.toFixed(2),
    },
  };

  return total;
}
