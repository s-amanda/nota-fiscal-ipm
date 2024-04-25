import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatTotal(notaFiscal: NotaFiscal, itens: Array<any>) {
  let baseCalculo = notaFiscal.valorServico.toFixed(2);

  if (notaFiscal.valorIss === null) {
    baseCalculo = '0.00';
  }

  let totalISSItens = 0;
  let totalVRetIr = 0;
  let totalVRetPISPASEP = 0;
  let totalVRetCOFINS = 0;
  let totalVRetCSLL = 0;

  const aliquotaIss = notaFiscal.aliquotaIss ?? notaFiscal.empresa.aliquotaIss;
  const pjComIss = notaFiscal.documentoTomador.length > 11 && aliquotaIss > 0;

  itens.forEach((item) => {
    const servico = item.serv;
    const ISSST = item.ISSST;

    totalISSItens = totalISSItens + Number(servico.vISS);
    totalVRetIr = totalVRetIr + Number(servico.vRetIR);
    totalVRetPISPASEP = totalVRetPISPASEP + Number(servico.vRetPISPASEP);
    totalVRetCOFINS = totalVRetCOFINS + Number(servico.vRetCOFINS);
    totalVRetCSLL = totalVRetCSLL + Number(servico.vRetCSLL);

    if (pjComIss) {
      totalISSItens = totalISSItens + Number(ISSST.vISSST);
    }
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
      [pjComIss ? 'vBCSTISS' : 'vBCISS']: baseCalculo,
      [pjComIss ? 'vSTISS' : 'vISS']: totalISSItens.toFixed(2),
    },
  };

  return total;
}
