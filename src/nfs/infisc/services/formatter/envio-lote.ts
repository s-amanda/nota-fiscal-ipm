import { ConfigService } from '@nestjs/config';
import format from 'date-fns/format';
import { Configuration } from 'src/config';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { calculoImposto } from './calculo-imposto';
import { removeFormat } from './cpf-cnpj';
import { formatFatura } from './fatura';
import { formatIdentificacao } from './id';
import { formatItem } from './item';
import { formatPrestador } from './prestador';
import { formatTomador } from './tomador';
import { formatTotal } from './total';

export function formatLote(
  notaFiscal: NotaFiscal,
  codigoIbge: string,
  config: ConfigService<Configuration>,
) {
  const empresa = notaFiscal.empresa;

  const id = formatIdentificacao(notaFiscal, config);
  const prest = formatPrestador(empresa);
  const tomS = formatTomador(notaFiscal, codigoIbge);
  const faturas = formatFatura(notaFiscal);

  const itens = notaFiscal.itens.map((item, index) => {
    const detalhes = {
      nItem: index + 1,
      serv: formatItem(item, empresa, notaFiscal, codigoIbge),
    };
    return detalhes;
  });

  const total = formatTotal(notaFiscal, itens);

  console.log(itens);

  const lote = {
    '@versao': '1.0',
    CNPJ: removeFormat(empresa.cnpj),
    dhTrans: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    'NFS-e': {
      infNFSe: {
        '@versao': '1.1',
        Id: id,
        prest: prest,
        TomS: tomS,
        det: itens,
        total: total,
        faturas: faturas,
        infAdicLT: empresa.codigoCidade,
        infAdic:
          `${notaFiscal.obsComplementar} Valor Aproximado de Tributos: Federais: R$ ${calculoImposto(notaFiscal).valorImpostoFederais} ` +
          `(13,45%) Municipais: R$ ${calculoImposto(notaFiscal).valorImpostoMunicipais} ` +
          `(2,09%) - Fonte: IBPT/FECOMERCIO RS`,
      },
    },
  };
  return lote;
}
