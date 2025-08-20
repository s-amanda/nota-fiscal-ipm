import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Mutex } from 'async-mutex';
import { Configuration } from 'src/config';
import { TarefaService } from 'src/soc/tarefa.service';

@Injectable()
export class FilaTarefas {
  private readonly logger = new Logger(FilaTarefas.name);

  private readonly lock = new Mutex();

  constructor(
    private readonly tarefaService: TarefaService,
    private readonly config: ConfigService<Configuration>,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processaItemFila() {
    const habilitado = this.config.get('soc.enabled', { infer: true });
    if (this.lock.isLocked() || !habilitado) {
      return;
    }
    await this.lock.runExclusive(async () => {
      this.logger.log('Iniciando rotina de envio de arquivos');
      const tarefas = await this.tarefaService.buscaTarefasDeEnvioPendentes();

      if (!tarefas.length) {
        this.logger.log('Nenhum arquivo encontrado');
        return;
      }

      this.logger.log(`${tarefas.length} arquivos encontrados`);

      for (const tarefa of tarefas) {
        this.logger.log(`Iniciando envio do arquivo id = ${tarefa.id}`);
        await this.tarefaService.executaTarefa(tarefa);
      }
    });
  }
}
