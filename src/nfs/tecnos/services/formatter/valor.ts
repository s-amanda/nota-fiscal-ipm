import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from 'src/nfs/infisc/services/formatter/cpf-cnpj';

export function formatValores(notaFiscal: NotaFiscal) {
  const documentoTomador = removeFormat(notaFiscal.documentoTomador);
  const aliquotaIss = notaFiscal.aliquotaIss ?? notaFiscal.empresa.aliquotaIss;
  let valorIss = notaFiscal.valorServico;
  let baseCalculo = 0.0;

  if (documentoTomador.length === 11 || notaFiscal.valorIss === null) {
    baseCalculo = notaFiscal.valorServico;
    valorIss = baseCalculo * (aliquotaIss / 100);
  }

  return {
    BaseCalculoCRS: baseCalculo,
    IrrfIndenizacao: '0',
    ValorServicos: notaFiscal.valorServico,
    ValorDeducoes: '0.00',
    ValorPis: notaFiscal.valorPis,
    ValorCofins: notaFiscal.valorCofins,
    ValorInss: '0.00',
    ValorIr: notaFiscal.valorIrrf,
    ValorCsll: notaFiscal.valorCsll,
    OutrasRetencoes: '0.00',
    ValorIss: valorIss,
    Aliquota: aliquotaIss,
    DescontoIncondicionado: '0.00',
    DescontoCondicionado: '0.00',
  };
}
