import format from 'date-fns/format';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { NfseEnvironment } from 'src/nfs/enums/environment.enum';
import { gerarChaveAcesso } from './chave-acesso';

export function formatIdentificacao(
  notaFiscal: NotaFiscal,
  environment: NfseEnvironment,
) {
  const data = format(new Date(), 'yyyy-MM-dd');
  const hora = format(new Date(), 'HH:mm');
  const empresa = notaFiscal.empresa;

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
    ambienteEmi: environment === NfseEnvironment.PRODUCTION ? 1 : 2,
    formaEmi: 2,
    empreitadaGlobal: 2,
  };

  return id;
}
