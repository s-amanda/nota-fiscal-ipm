import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Mutex } from 'async-mutex';
import { Configuration } from 'src/config';
import { QueueService } from 'src/soc/queue.service';

@Injectable()
export class FileQueue {
  private readonly logger = new Logger(FileQueue.name);

  private readonly lock = new Mutex();

  constructor(
    private readonly queue: QueueService,
    private readonly config: ConfigService<Configuration>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async uploadFilesQueue() {
    const enabled = this.config.get('soc.enabled', { infer: true });
    if (this.lock.isLocked() || !enabled) {
      return;
    }
    await this.lock.runExclusive(async () => {
      this.logger.log('Iniciando rotina de envio de arquivos');
      const jobs = await this.queue.getPendingJobs();

      if (!jobs.length) {
        this.logger.log('Nenhum arquivo encontrado');
        return;
      }

      this.logger.log(`${jobs.length} arquivos encontrados`);

      for (const job of jobs) {
        this.logger.log(`Iniciando envio do arquivo id = ${job.id}`);
        await this.queue.execute(job);
      }
    });
  }
}
