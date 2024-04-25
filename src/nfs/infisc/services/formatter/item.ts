import { Empresa } from 'src/nfs/entities/empresa.entity';
import { ItemNotaServico } from 'src/nfs/entities/item-nota-servico.entity';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';

export function formatItem(
  item: ItemNotaServico,
  empresa: Empresa,
  notaFiscal: NotaFiscal,
) {
  const aliquotaIss = notaFiscal.aliquotaIss ?? empresa.aliquotaIss;
  const aliquotaPis = notaFiscal.aliquotaPis ?? 0;
  const aliquotaCsll = notaFiscal.aliquotaCsll ?? 0;
  const aliquotaCofins = notaFiscal.aliquotaCofins ?? 0;
  const aliquotaIr = notaFiscal.aliquotaIr ?? 0;

  const serv = {
    cServ: empresa.codigoServico,
    cLCServ: empresa.codigoLcServico,
    xServ: item.descricao ?? item.servico.descricao,
    localTributacao: empresa.codigoCidade,
    localVerifResServ: 1, //Brasil
    uTrib: 'UN',
    qTrib: item.quantidade,
    vUnit: item.valorUnidade.toFixed(2),
    vServ: (item.valorUnidade * item.quantidade).toFixed(2),
    vDesc: '0.00',
    vBCISS: (item.valorUnidade * item.quantidade).toFixed(2),
    pISS: aliquotaIss.toFixed(2),
    vISS: ((item.quantidade * item.valorUnidade * aliquotaIss) / 100).toFixed(
      2,
    ),
    vRed: '0.00',
    vBCRetIR: '0.00',
    pRetIR: aliquotaIr.toFixed(2),
    vRetIR: ((item.quantidade * item.valorUnidade * aliquotaIr) / 100).toFixed(
      2,
    ),
    vBCCOFINS: '0.00',
    pRetCOFINS: aliquotaCofins.toFixed(2),
    vRetCOFINS: (
      (item.quantidade * item.valorUnidade * aliquotaCofins) /
      100
    ).toFixed(2),
    vBCCSLL: '0.00',
    pRetCSLL: aliquotaCsll.toFixed(2),
    vRetCSLL: (
      (item.quantidade * item.valorUnidade * aliquotaCsll) /
      100
    ).toFixed(2),
    vBCPISPASEP: '0.00',
    pRetPISPASEP: aliquotaPis.toFixed(2),
    vRetPISPASEP: (
      (item.quantidade * item.valorUnidade * aliquotaPis) /
      100
    ).toFixed(2),
  };

  return serv;
}
