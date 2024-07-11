import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { removeFormat } from 'src/nfs/infisc/formatter/cpf-cnpj';

export function formatPrestador(notaFiscal: NotaFiscal) {
  const empresa = notaFiscal.empresa;
  const cnpj = removeFormat(empresa.cnpj);

  return {
    CpfCnpj: {
      Cnpj: cnpj,
    },
    RazaoSocial: empresa.nome,
    InscricaoMunicipal: empresa.inscricaoMunicipal,
    InscricaoEstadual: '',
  };
}
