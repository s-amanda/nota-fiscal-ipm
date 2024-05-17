import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import format from 'date-fns/format';
import { Repository } from 'typeorm';
import { Historico } from '../entities/historico.entity';
import { NotaFiscal } from '../entities/nota-fiscal.entity';

@Injectable()
export class HistoricoNfseService {
  constructor(
    @InjectRepository(Historico)
    private historicoRepository: Repository<Historico>,
  ) {}

  async getHistoricoId() {
    const historico = await this.historicoRepository
      .createQueryBuilder('historico')
      .select('MAX(historico.id)', 'id')
      .getRawOne();

    return (historico.id as number | null) ?? 1;
  }

  async gravarHistorico(
    notaFiscal: NotaFiscal,
    xml: string,
    situacao: boolean,
    numeroProtocolo: string | null,
    chaveAcesso: string | null,
  ) {
    return this.historicoRepository.insert({
      id: Number(await this.getHistoricoId()) + 1,
      xml: xml,
      //idNotaFiscal: 111,
      idNotaFiscal: notaFiscal.id,
      data: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      status: situacao ? 1 : 3,
      protocolo: numeroProtocolo,
      chaveAcesso: chaveAcesso,
      //user: '12',
    });
  }
}
