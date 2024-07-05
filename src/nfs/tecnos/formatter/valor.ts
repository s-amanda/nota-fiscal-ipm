import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatValores(notaFiscal: NotaFiscal) {
  const aliquotaIss = notaFiscal.aliquotaIss ?? notaFiscal.empresa.aliquotaIss;
  const aliquotaPis = notaFiscal.aliquotaPis ?? 0;
  const aliquotaCsll = notaFiscal.aliquotaCsll ?? 0;
  const aliquotaCofins = notaFiscal.aliquotaCofins ?? 0;
  const aliquotaIr = notaFiscal.aliquotaIr ?? 0;

  return {
    BaseCalculoCRS: '0.00',
    IrrfIndenizacao: '0.00',
    ValorServicos: notaFiscal.valorServico.toFixed(2),
    ValorDeducoes: '0.00',
    ValorPis: ((notaFiscal.valorServico * aliquotaPis) / 100).toFixed(2),
    ValorCofins: ((notaFiscal.valorServico * aliquotaCofins) / 100).toFixed(2),
    ValorInss: '0.00',
    ValorIr: ((notaFiscal.valorServico * aliquotaIr) / 100).toFixed(2),
    ValorCsll: ((notaFiscal.valorServico * aliquotaCsll) / 100).toFixed(2),
    OutrasRetencoes: '0.00',
    // ValorIss: '0.00',
    Aliquota: aliquotaIss,
    DescontoIncondicionado: '0.00',
    DescontoCondicionado: '0.00',
  };
}
