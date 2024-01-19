import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, JobStatus } from 'src/soc/entities/job';
import { SocIntegrationService } from 'src/soc/soc-integration.service';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectRepository(Job)
    private readonly repository: Repository<Job>,
    private socIntegration: SocIntegrationService,
  ) {}

  getPendingJobs() {
    return this.repository.findBy({ status: IsNull() });
  }

  private async getJobFile(job: Job) {
    const [file] = await this.repository.find({
      where: { id: job.id },
      select: ['fileContent'],
    });
    if (!file) {
      throw new Error('Arquivo não encontrado');
    }
    return file.fileContent;
  }

  async execute(job: Job) {
    const fileContent = await this.getJobFile(job);

    try {
      await this.socIntegration.sendFile({
        file: {
          type: 'application/pdf',
          name: job.fileName,
          content: fileContent,
        },
        classification: job.classification,
        sequenceNumber: job.sequenceNumber,
      });

      this.logger.log(`Arquivo id = ${job.id} enviado`);
      await this.repository.update(
        { id: job.id },
        { status: JobStatus.COMPLETED },
      );
    } catch (error: any) {
      this.logger.error(`Falha ao enviar arquivo id = ${job.id}`, error);
      await this.repository.update(
        { id: job.id },
        { status: JobStatus.FAILED, response: error?.message },
      );
    }
  }
}
