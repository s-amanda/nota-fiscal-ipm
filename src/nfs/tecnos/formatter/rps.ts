import { format } from 'date-fns';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatRps(notaFiscal: NotaFiscal) {
  return {
    IdentificacaoRps: {
      Numero: notaFiscal.numero,
      Serie: 'UNICA',
      Tipo: '1', // 1 – RPS
    },
    DataEmissao: format(
      notaFiscal.dataRetroativa ?? new Date(),
      "yyyy-MM-dd'T'HH:mm:ss",
    ),
    Status: '1',
    RpsSubstituido: {
      Numero: '',
      Serie: '',
      Tipo: '0',
    },
  };
}
