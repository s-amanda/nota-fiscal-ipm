import format from 'date-fns/format';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatFatura(notaFiscal: NotaFiscal) {
  return {
    fat: {
      nItem: 1,
      nFat: 1,
      dVenc: format(new Date(), 'yyyy-MM-dd'),
      vFat: notaFiscal.valorTotal.toFixed(2),
    },
  };
}
