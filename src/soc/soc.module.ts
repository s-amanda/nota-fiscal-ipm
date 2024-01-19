import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from 'src/soc/entities/job';
import { FileQueue } from 'src/soc/queue';
import { QueueService } from 'src/soc/queue.service';
import { FileUploadService } from './file-upload.service';
import { SocIntegrationService } from './soc-integration.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Job])],
  providers: [
    FileUploadService,
    SocIntegrationService,
    FileQueue,
    QueueService,
  ],
})
export class SocModule {}
