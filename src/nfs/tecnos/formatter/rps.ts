import format from 'date-fns/format';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatRps(notaFiscal: NotaFiscal) {
  return {
    IdentificacaoRps: {
      Numero: notaFiscal.numero,
      Serie: 'UNICA',
      Tipo: '1',
      // 1 – RPS
      // 2 – Nota Fiscal Conjugada (Mista)
      // 3 – Cupom
    },
    DataEmissao: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    //DataEmissao: null,
    Status: '1',
  };
}
