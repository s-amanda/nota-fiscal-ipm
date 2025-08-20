import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration, buildConfiguration } from './config';
import { Cidade } from './nfs/entities/cidade.entity';
import { Empresa } from './nfs/entities/empresa.entity';
import { Historico } from './nfs/entities/historico.entity';
import { ItemNotaServico } from './nfs/entities/item-nota-servico.entity';
import { NotaFiscal } from './nfs/entities/nota-fiscal.entity';
import { Pessoa } from './nfs/entities/pessoa.entity';
import { Servico } from './nfs/entities/servico.entity';
import { Uf } from './nfs/entities/uf.entity';
import { NfsModule } from './nfs/nfs.module';
import { TarefaEnvioSoc } from './soc/entities/tarefa-envio-soc';
import { SocModule } from './soc/soc.module';
import { ExameSoc } from './soc/entities/exame-soc';

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
        logging: ['warn'],
        options: {
          trustServerCertificate: true,
          encrypt: false,
        },
        entities: [
          TarefaEnvioSoc,
          ExameSoc,
          Empresa,
          NotaFiscal,
          ItemNotaServico,
          Cidade,
          Servico,
          Pessoa,
          Uf,
          Historico,
        ],
      }),
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      load: [buildConfiguration],
    }),
    TypeOrmModule.forFeature([TarefaEnvioSoc]),
    SocModule,
    NfsModule,
  ],
})
export class AppModule {}
