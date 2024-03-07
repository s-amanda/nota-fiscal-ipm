import { Module } from '@nestjs/common';
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
import { InfiscClient } from './infisc.client';
import { HistoricoNfseService } from './services/historico-nfse.service';
import { InfiscService } from './services/infisc.service';
import { NotaFiscalService } from './services/nfse.service';

@Module({
  imports: [
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
  ],
  controllers: [NfseController],
})
export class NfsModule {}
