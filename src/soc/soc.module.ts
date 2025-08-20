import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TarefaEnvioSoc } from 'src/soc/entities/tarefa-envio-soc';
import { FilaTarefas } from 'src/soc/fila-tarefas';
import { TarefaService } from 'src/soc/tarefa.service';
import { IntegracaoSocService } from './integracao-soc.service';
import { PedidoExameRepository } from './pedido-exame.repository';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([TarefaEnvioSoc])],
  providers: [
    IntegracaoSocService,
    FilaTarefas,
    TarefaService,
    PedidoExameRepository,
  ],
})
export class SocModule {}
