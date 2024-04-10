import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from 'src/nfs/infisc/services/formatter/cpf-cnpj';

export function formatTomador(notaFiscal: NotaFiscal, codigoIbge: string) {
  const numeroDocumento = removeFormat(
    notaFiscal.documentoTomador || '00000000000',
  );

  return {
    IdentificacaoTomador: {
      CpfCnpj: {
        [numeroDocumento.length > 11 ? 'Cnpj' : 'Cpf']: numeroDocumento,
      },
      InscricaoMunicipal: '',
    },
    RazaoSocial: notaFiscal.nomeTomador,
    Endereco: {
      Endereco: notaFiscal.logradouro,
      Numero: notaFiscal.numeroEndereco,
      Complemento: notaFiscal.complemento,
      Bairro: notaFiscal.bairro,
      CodigoMunicipio: codigoIbge,
      Uf: notaFiscal.uf,
      CodigoPais: '1058',
      Cep: String(notaFiscal.cep).replace(/-/g, ''),
    },
    Contato: {
      Telefone: notaFiscal.telefone,
      Email: notaFiscal.email,
    },
  };
}
