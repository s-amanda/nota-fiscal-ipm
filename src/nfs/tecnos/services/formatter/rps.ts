import format from 'date-fns/format';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatRps(notaFiscal: NotaFiscal) {
  const empresa = notaFiscal.empresa;

  return {
    IdentificacaoRps: {
      Numero: empresa.numeroRps + 1,
      //update TB_EMPRESA
      Serie: 'UNICA',
      Tipo: '1',
      // 1 – RPS
      // 2 – Nota Fiscal Conjugada (Mista)
      // 3 – Cupom
    },
    DataEmissao: format(new Date(), 'yyyy-MM-ddTHH:mm:ss'),
    Status: '1',
    // 1 – Normal
    // 2 – Cancelado
  };
}
