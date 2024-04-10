import { Empresa } from 'src/nfs/entities/empresa.entity';
import { removeFormat } from './cpf-cnpj';

export function formatPrestador(empresa: Empresa) {
  const cnpj = removeFormat(empresa.cnpj);

  const prest = {
    CNPJ: cnpj,
    xNome: empresa.nome,
    xFant: '',
    IM: empresa.inscricaoMunicipal,
    xEmail: empresa.email,
    end: {
      xLgr: empresa.logradouro,
      nro: empresa.numeroEndereco,
      xCpl: empresa.complemento,
      xBairro: empresa.bairro,
      cMun: empresa.codigoCidade,
      xMun: empresa.cidade,
      UF: empresa.uf,
      CEP: empresa.cep.replace(/-/g, ''),
      cPais: 1058,
      xPais: 'BRASIL',
    },
    fone: empresa.fone,
    IE: '',
    regimeTrib: empresa.simplesNacional === 'S' ? 1 : 3,
  };

  return prest;
}
