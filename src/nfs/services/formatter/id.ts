import { ConfigService } from '@nestjs/config';
import format from 'date-fns/format';
import { Configuration } from 'src/config';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { gerarChaveAcesso } from './chave-acesso';

export function formatIdentificacao(notaFiscal: NotaFiscal) {
  const data = format(new Date(), 'yyyy-MM-dd');
  const hora = format(new Date(), 'HH:mm');
  const empresa = notaFiscal.empresa;
  const config = new ConfigService<Configuration>();

  const id = {
    'cNFS-e': 131949447,
    mod: 98,
    serie: empresa.serie || 'S',
    'nNFS-e': notaFiscal.numero,
    dEmi: data,
    hEmi: hora,
    tpNF: 1,
    refNF: gerarChaveAcesso(notaFiscal),
    tpEmis: 'N',
    cancelada: 'N',
    canhoto: 0,
    ambienteEmi: config.getOrThrow('nfse.caxias.ambiente', {
      infer: true,
    }), //hml
    formaEmi: 2,
    empreitadaGlobal: 2,
  };

  return id;
}
