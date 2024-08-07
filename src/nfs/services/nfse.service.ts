import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Mutex } from 'async-mutex';
import format from 'date-fns/format';
import { Repository } from 'typeorm';
import { ClientError } from '../client/response';
import { Cidade } from '../entities/cidade.entity';
import { NotaFiscal } from '../entities/nota-fiscal.entity';
import { MotivoCancelamento } from '../enums/motivo-cancelamento.enum';
import { NotaJaCanceladaException } from '../exceptions/nota-ja-cancelada';
import { EmailService } from './email.service';
import { HistoricoNfseService } from './historico-nfse.service';
import { NfseStrategyProvider } from './nfse.strategy';

/*
  Classe que gerencia as notas fiscais em nível mais alto, sem diferenciar provedores.
  Os detalhes de cada provedor são definidos dentro do strategy.
  Aqui ficam regras que são gerais para todos os provedores e cidades, como gravar resultados no banco de dados.
*/
@Injectable()
export class NotaFiscalService {
  private logger = new Logger(NotaFiscalService.name);
  private mutex = new Mutex();

  constructor(
    @InjectRepository(NotaFiscal)
    private notaFiscalRepository: Repository<NotaFiscal>,
    @InjectRepository(Cidade)
    private cidadeRepository: Repository<Cidade>,
    private emailService: EmailService,
    private strategyProvider: NfseStrategyProvider,
    private historicoNfseService: HistoricoNfseService,
  ) {}

  async enviarNotaFiscal(id: number) {
    return this.mutex.runExclusive(async () => {
      const notaFiscal = await this.buscarNotaFiscal(id);
      if (notaFiscal.notaFiscalSalva === 'S') {
        throw new BadRequestException('A nota fiscal já foi enviada');
      }

      notaFiscal.numero = await this.buscarNumeroNotaEmpresa(notaFiscal);
      this.logger.log(`Gerando nota número ${notaFiscal.numero}`);

      const codigoIbge = await this.getCodigoIbge(
        notaFiscal.cidade,
        notaFiscal.uf,
      );

      const strategy = this.strategyProvider.getStrategy(notaFiscal);

      try {
        const {
          id: idNotaGerada,
          protocolo,
          response,
        } = await strategy.enviarNotaFiscal(notaFiscal, {
          codigoIbge,
        });

        await this.historicoNfseService.gravarHistorico(
          notaFiscal,
          response.rawRequest,
          true,
          protocolo,
          idNotaGerada,
        );
        await this.historicoNfseService.gravarHistorico(
          notaFiscal,
          response.rawResponse,
          true,
          protocolo,
          idNotaGerada,
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
            numeroLoteRps: idNotaGerada,
          },
        );
        this.logger.log(`Nota gerada com sucesso`);

        if (notaFiscal.email) {
          this.enviarEmailNotaFiscal(notaFiscal).catch(console.error);
        }

        return { id: idNotaGerada };
      } catch (error) {
        this.logger.error(`Erro ao gerar nota: ${error}`);
        if (error instanceof ClientError) {
          await this.historicoNfseService.gravarHistorico(
            notaFiscal,
            error.rawRequest,
            false,
            null,
            null,
          );
          await this.historicoNfseService.gravarHistorico(
            notaFiscal,
            error.rawResponse,
            false,
            null,
            null,
          );
        }
        await this.notaFiscalRepository.update({ id }, { sucesso: 'N' });
        throw error;
      }
    });
  }

  async gerarPdf(id: number) {
    const notaFiscal = await this.buscarNotaFiscal(id);

    const strategy = this.strategyProvider.getStrategy(notaFiscal);
    return await strategy.gerarPdf(notaFiscal);
  }

  async cancelarNotaFiscal(id: number, motivo: MotivoCancelamento) {
    const notaFiscal = await this.buscarNotaFiscal(id);
    if (notaFiscal.notaFiscalImpressa === 'A') {
      throw new NotaJaCanceladaException();
    }

    const strategy = this.strategyProvider.getStrategy(notaFiscal);
    await this.notaFiscalRepository.update(
      { id },
      {
        dataCancelamento: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        notaFiscalImpressa: 'A',
      },
    );
    await strategy.cancelarNotaFiscal(notaFiscal, motivo);
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

  private async buscarNumeroNotaEmpresa(notaFiscal: NotaFiscal) {
    const idEmpresa = notaFiscal.empresa.id;

    const { numero } = await this.notaFiscalRepository
      .createQueryBuilder('notaFiscal')
      .select('MAX(notaFiscal.numero)', 'numero')
      .innerJoin('notaFiscal.empresa', 'empresa')
      .where('empresa.id = :idEmpresa', { idEmpresa })
      .andWhere(
        `(notaFiscal.notaFiscalImpressa = 'S' or notaFiscal.notaFiscalImpressa = 'A')`,
      )
      .andWhere('notaFiscal.numeroLote is not null')
      .getRawOne();

    return (numero + 1) as number;
  }

  private async enviarEmailNotaFiscal(notaFiscal: NotaFiscal) {
    const pdf = await this.gerarPdf(notaFiscal.id);

    await this.emailService.sendEmail(
      notaFiscal.email,
      pdf,
      'Nota Fiscal de Serviço Eletrônica',
    );
  }
}
