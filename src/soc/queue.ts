import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Mutex } from 'async-mutex';
import { QueueService } from 'src/soc/queue.service';

@Injectable()
export class FileQueue {
  private readonly logger = new Logger(FileQueue.name);

  private readonly lock = new Mutex();

  constructor(private readonly queue: QueueService) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async uploadFilesQueue() {
    if (this.lock.isLocked()) {
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
