import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { ExameSoc } from './entities/exame-soc';

export interface ConsultaExamePedido {
  sequencialResultado: string;
  dataLiberado: Date;
}

@Injectable()
export class PedidoExameRepository extends Repository<ExameSoc> {
  constructor(private readonly entityManager: EntityManager) {
    super(ExameSoc, entityManager);
  }

  async consultaExamesPedido(
    codigoPedido: number,
    postoPedido: string,
  ): Promise<ConsultaExamePedido[]> {
    return this.entityManager.query(
      `
		select distinct mv.ordem_movex, 
        es.sequencial_resultado as sequencialResultado, 
        mv.data_liberado as dataLiberado
        from TB_PEDIDO_SOC ps
        join TB_EXAME_SOC es on ps.id = es.pedido_id
        join MOV_EX mv on ps.cod_pedido = mv.codigo_pedido and ps.posto_pedido = mv.posto_pedido and es.ordem_movex = mv.ordem_movex
        where mv.codigo_pedido = '${codigoPedido}' and mv.posto_pedido = '${postoPedido}'
		`,
    );
  }
}
