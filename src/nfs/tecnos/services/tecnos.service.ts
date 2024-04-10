import { Injectable } from '@nestjs/common';
import { NotaFiscal } from 'src/nfs/entities/nota-fiscal.entity';
import { TecnosClient } from '../tecnos.client';
import { formatInfDecPrestacaoServico } from './formatter/infPrestacaoServico';

@Injectable()
export class TecnosService {
  constructor(private tecnosClient: TecnosClient) {}

  async enviarNotaFiscal(notaFiscal: NotaFiscal, codigoIbge: string) {
    const listaRps = {
      Rps: {
        tcDeclaracaoPrestacaoServico: {
          InfDeclaracaoPrestacaoServico: formatInfDecPrestacaoServico(
            notaFiscal,
            codigoIbge,
          ),
        },
      },
    };

    const loteRps = {
      // "@Id": "R12024886592890001040000000000000001",
      '@versao': '20.01',
      NumeroLote: '1',
      CpfCnpj: {
        Cnpj: '88659289000104',
      },
      InscricaoMunicipal: '526',
      QuantidadeRps: '1',
      ListaRps: listaRps,
    };

    return loteRps;
  }
}
