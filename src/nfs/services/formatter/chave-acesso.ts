import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from './cpf-cnpj';

export function gerarChaveAcesso(notaFiscal: NotaFiscal) {
  const empresa = notaFiscal.empresa;
  const cnpj = removeFormat(empresa.cnpj);
  const serie = (empresa.serie || 'S').toUpperCase().padEnd(3, '0');
  //const numeroNotaFiscal = String(111).padStart(9, '0');
  const numeroNotaFiscal = String(notaFiscal.numero).padStart(9, '0');

  return `43${cnpj}90${serie}${numeroNotaFiscal}131949447`;
}
