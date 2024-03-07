import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mutex } from 'async-mutex';
import { Repository } from 'typeorm';
import { Cidade } from '../entities/cidade.entity';
import { NotaFiscal } from '../entities/nota-fiscal.entity';
import { InfiscService } from './infisc.service';

@Injectable()
export class NotaFiscalService {
  private mutex = new Mutex();

  constructor(
    @InjectRepository(NotaFiscal)
    private notaFiscalRepository: Repository<NotaFiscal>,
    @InjectRepository(Cidade)
    private cidadeRepository: Repository<Cidade>,
    private infiscService: InfiscService,
  ) {}

  async enviarNotaFiscal(id: number) {
    return this.mutex.runExclusive(async () => {
      const notaFiscal = await this.buscarNotaFiscal(id);
      if (notaFiscal.notaFiscalSalva === 'S') {
        throw new BadRequestException('Essa nota fiscal já foi enviada');
      }
      notaFiscal.numero = await this.buscarNumeroNotaEmpresa(notaFiscal);
      //notaFiscal.numero = 168;

      const codigoIbge = await this.getCodigoIbge(
        notaFiscal.cidade,
        notaFiscal.uf,
      );

      try {
        const envio = await this.infiscService.enviarNotaFiscal(
          notaFiscal,
          codigoIbge,
        );

        await this.notaFiscalRepository.update(
          { id },
          { notaFiscalSalva: 'S', numero: notaFiscal.numero, sucesso: 'S' },
        );
        return envio;
      } catch (error) {
        await this.notaFiscalRepository.update({ id }, { sucesso: 'N' });
        throw error;
      }
    });
  }

  async gerarPdf(id: number) {
    const notaFiscal = await this.buscarNotaFiscal(id);
    const pdf = await this.infiscService.gerarPdf(notaFiscal);

    await this.notaFiscalRepository.update(
      { id: id },
      { notaFiscalImpressa: 'S' },
    );

    return pdf;
  }

  async cancelarNotaFiscal(id: number) {
    const notaFiscal = await this.buscarNotaFiscal(id);
    return this.infiscService.cancelarNotaFiscal(notaFiscal);
  }

  private async buscarNotaFiscal(id: number) {
    const [notaFiscal] = await this.notaFiscalRepository.find({
      where: { id },
      relations: ['itens', 'empresa', 'pessoa'],
    });
    if (!notaFiscal) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }
    return notaFiscal;
  }

  private async getCodigoIbge(nomeCidade: string, uf: string) {
    const { codigoIbge } = await this.cidadeRepository
      .createQueryBuilder('cidade')
      .select('MAX(cidade.codigoIbge)', 'codigoIbge')
      .innerJoin('cidade.uf', 'uf')
      .where('UPPER(cidade.descricao) = UPPER(:nomeCidade)', { nomeCidade })
      .andWhere('UPPER(uf.uf) = LTRIM(UPPER(:uf))', { uf })
      .getRawOne();
    return codigoIbge as string;
  }

  async buscarNumeroNotaEmpresa(notaFiscal: NotaFiscal) {
    const idEmpresa = notaFiscal.empresa.id;

    const { numero } = await this.notaFiscalRepository
      .createQueryBuilder('notaFiscal')
      .select('MAX(notaFiscal.numero)', 'numero')
      .innerJoin('notaFiscal.empresa', 'empresa')
      .where('empresa.id = :idEmpresa', { idEmpresa })
      .getRawOne();

    return (numero + 1) as number;
  }
}
