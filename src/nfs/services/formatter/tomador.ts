import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from './cpf-cnpj';

export function formatTomador(notaFiscal: NotaFiscal, codigoIbge: string) {
  const numeroDocumento = removeFormat(
    notaFiscal.documentoTomador || '00000000000',
  );

  const tomS = {
    [numeroDocumento.length > 11 ? 'CNPJ' : 'CPF']: numeroDocumento,
    xNome: notaFiscal.nomeTomador,
    ender: {
      xLgr: notaFiscal.logradouro,
      nro: notaFiscal.numeroEndereco,
      xCpl: notaFiscal.complemento,
      xBairro: notaFiscal.bairro,
      cMun: codigoIbge,
      xMun: notaFiscal.cidade,
      UF: notaFiscal.uf,
      CEP: String(notaFiscal.cep).replace(/-/g, ''),
      cPais: 1058,
      xPais: 'BRASIL',
    },
    IE: '',
    IM: '',
  };
  return tomS;
}
