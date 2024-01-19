import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration, buildConfiguration } from 'src/config';
import { Job } from 'src/soc/entities/job';
import { SocModule } from './soc/soc.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Configuration>) => ({
        type: 'mssql',
        host: config.getOrThrow('database.hostname', { infer: true }),
        port: config.getOrThrow('database.port', { infer: true }),
        username: config.getOrThrow('database.username', { infer: true }),
        password: config.getOrThrow('database.password', { infer: true }),
        database: config.getOrThrow('database.database', { infer: true }),
        synchronize: false,
        logging: ['query'],
        options: {
          trustServerCertificate: true,
          encrypt: false,
        },
        entities: [Job],
      }),
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [buildConfiguration],
    }),
    TypeOrmModule.forFeature([Job]),
    SocModule,
  ],
})
export class AppModule {}
