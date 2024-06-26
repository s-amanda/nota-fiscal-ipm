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
    //DataEmissao: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
    DataEmissao: '2024-06-15T14:01:41',
    Status: '1',
  };
}
