import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { MotivoCancelamento } from 'src/nfs/enums/motivo-cancelamento.enum';
import { removeFormat } from 'src/nfs/infisc/formatter/cpf-cnpj';

export function formatInfoCancelamento(
  notaFiscal: NotaFiscal,
  motivo: MotivoCancelamento,
) {
  const empresa = notaFiscal.empresa;

  return {
    InfPedidoCancelamento: {
      '@Id': notaFiscal.numeroLoteRps,
      IdentificacaoNfse: {
        Numero: notaFiscal.numero,
        CpfCnpj: {
          Cnpj: removeFormat(empresa.cnpj),
        },
        InscricaoMunicipal: empresa.inscricaoMunicipal,
        CodigoMunicipio: empresa.codigoCidade,
      },
      CodigoCancelamento:
        motivo === MotivoCancelamento.DADOS_INCORRETOS ? 1 : 2,
      //MotivoCancelamento: 'Problema na geração da nota',
    },
  };
}
