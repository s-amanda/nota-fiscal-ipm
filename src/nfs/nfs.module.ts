import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfseController } from './controllers/nfse.controller';
import { Cidade } from './entities/cidade.entity';
import { Empresa } from './entities/empresa.entity';
import { Historico } from './entities/historico.entity';
import { ItemNotaServico } from './entities/item-nota-servico.entity';
import { NotaFiscal } from './entities/nota-fiscal.entity';
import { Pessoa } from './entities/pessoa.entity';
import { Servico } from './entities/servico.entity';
import { Uf } from './entities/uf.entity';
import { InfiscClient } from './infisc/infisc.client';
import { InfiscService } from './infisc/services/infisc.service';
import { EmailService } from './services/email.service';
import { HistoricoNfseService } from './services/historico-nfse.service';
import { NotaFiscalService } from './services/nfse.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Empresa,
      ItemNotaServico,
      NotaFiscal,
      Cidade,
      Pessoa,
      Servico,
      Uf,
      Historico,
    ]),
  ],
  providers: [
    InfiscClient,
    InfiscService,
    NotaFiscalService,
    HistoricoNfseService,
    EmailService,
  ],
  controllers: [NfseController],
})
export class NfsModule {}
