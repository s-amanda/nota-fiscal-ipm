import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from 'src/nfs/infisc/formatter/cpf-cnpj';

export function formatPrestador(notaFiscal: NotaFiscal) {
  const empresa = notaFiscal.empresa;
  const cnpj = removeFormat(empresa.cnpj);

  return {
    CpfCnpj: {
      Cnpj: cnpj,
    },
    InscricaoMunicipal: empresa.inscricaoMunicipal,
    InscricaoEstadual: '',

    RazaoSocial: empresa.nome,
    Endereco: {
      Endereco: empresa.logradouro,
      Numero: empresa.numeroEndereco,
      Complemento: empresa.complemento,
      Bairro: empresa.bairro,
      CodigoMunicipio: empresa.codigoMunicipioTributacao,
      Uf: empresa.uf,
      CodigoPais: '1058',
      Cep: empresa.cep,
    },
    Contato: {
      Telefone: notaFiscal.telefone,
      Email: notaFiscal.email,
    },
  };
}
