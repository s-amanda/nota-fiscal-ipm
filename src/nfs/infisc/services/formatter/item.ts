import { Empresa } from 'src/nfs/entities/empresa.entity';
import { ItemNotaServico } from 'src/nfs/entities/item-nota-servico.entity';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatItem(
  item: ItemNotaServico,
  empresa: Empresa,
  notaFiscal: NotaFiscal,
) {
  const aliquota = notaFiscal.aliquotaIss ?? empresa.aliquotaIss;

  const serv = {
    cServ: empresa.codigoServico,
    //cLCServ: empresa.codigoLcServico,
    cLCServ: '0403',
    xServ: item.descricao ?? item.servico.descricao,
    localTributacao: empresa.codigoMunicipioTributacao,
    localVerifResServ: 1, //Brasil
    uTrib: 'UN',
    qTrib: item.quantidade,
    vUnit: item.valorUnidade.toFixed(2),
    vServ: (item.valorUnidade * item.quantidade).toFixed(2),
    vDesc: 0.0,
    vBCISS: (item.valorUnidade * item.quantidade).toFixed(2),
    pISS: aliquota,
    vISS: ((item.quantidade * item.valorUnidade * aliquota) / 100).toFixed(2),
    vRed: 0.0,
  };

  return serv;
}
