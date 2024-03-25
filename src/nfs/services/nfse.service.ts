import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Mutex } from 'async-mutex';
import format from 'date-fns/format';
import { Configuration } from 'src/config';
import { Repository } from 'typeorm';
import { Cidade } from '../entities/cidade.entity';
import { NotaFiscal } from '../entities/nota-fiscal.entity';
import { MotivoCancelamento } from '../enums/motivo-cancelamento.enum';
import { NotaJaCanceladaException } from '../exceptions/nota-ja-cancelada';
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
    private config: ConfigService<Configuration>,
  ) {}

  async enviarNotaFiscal(id: number) {
    return this.mutex.runExclusive(async () => {
      const notaFiscal = await this.buscarNotaFiscal(id);
      if (notaFiscal.notaFiscalSalva === 'S') {
        throw new BadRequestException('Essa nota fiscal já foi enviada');
      }
      notaFiscal.numero = await this.buscarNumeroNotaEmpresa(notaFiscal);

      const codigoIbge = await this.getCodigoIbge(
        notaFiscal.cidade,
        notaFiscal.uf,
      );

      try {
        const envio = await this.infiscService.enviarNotaFiscal(
          notaFiscal,
          codigoIbge,
          this.config,
        );

        await this.notaFiscalRepository.update(
          { id },
          {
            notaFiscalSalva: 'S',
            notaFiscalImpressa: 'S',
            numero: notaFiscal.numero,
            sucesso: 'S',
            numeroLote: notaFiscal.numero,
            numeroRps: notaFiscal.numero,
          },
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

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!notaFiscal) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }

    const pdf = await this.infiscService.gerarPdf(notaFiscal);

    await this.notaFiscalRepository.update(
      { id: id },
      { notaFiscalImpressa: 'S' },
    );

    return pdf;
  }

  async cancelarNotaFiscal(id: number, motivo: MotivoCancelamento) {
    const notaFiscal = await this.buscarNotaFiscal(id);

    if (notaFiscal.notaFiscalImpressa === 'A') {
      throw new NotaJaCanceladaException();
    }

    await this.notaFiscalRepository.update(
      { id },
      {
        dataCancelamento: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        notaFiscalImpressa: 'A',
      },
    );

    return this.infiscService.cancelarNotaFiscal(notaFiscal, motivo);
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
