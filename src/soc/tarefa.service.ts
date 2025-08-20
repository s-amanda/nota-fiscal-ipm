import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TarefaEnvioSoc, StatusEnvio } from 'src/soc/entities/tarefa-envio-soc';
import {
  IntegracaoSocException,
  IntegracaoSocService,
} from 'src/soc/integracao-soc.service';
import { IsNull, Repository } from 'typeorm';
import { PedidoExameRepository } from './pedido-exame.repository';

@Injectable()
export class TarefaService {
  private readonly logger = new Logger(TarefaService.name);

  constructor(
    @InjectRepository(TarefaEnvioSoc)
    private readonly repository: Repository<TarefaEnvioSoc>,
    private readonly pedidoExameRepository: PedidoExameRepository,
    private readonly integracaoSoc: IntegracaoSocService,
  ) {}

  buscaTarefasDeEnvioPendentes() {
    return this.repository.findBy({ status: IsNull() });
  }

  private async baixaArquivoTarefa(tarefa: TarefaEnvioSoc) {
    const [arquivo] = await this.repository.find({
      where: { id: tarefa.id },
      select: ['conteudoArquivo'],
    });
    if (!arquivo) {
      throw new Error('Arquivo não encontrado');
    }
    return arquivo.conteudoArquivo;
  }

  async executaTarefa(tarefa: TarefaEnvioSoc) {
    const conteudoArquivo = await this.baixaArquivoTarefa(tarefa);

    try {
      const dadosExamesPedido =
        await this.pedidoExameRepository.consultaExamesPedido(
          tarefa.codigoPedido,
          tarefa.postoPedido,
        );

      for (const exame of dadosExamesPedido) {
        console.log(dadosExamesPedido)
        await this.integracaoSoc.perencheDataResultadoExame(tarefa, exame);
      }

      const { requisicaoXml, retornoXml } =
        await this.integracaoSoc.uploadArquivo(tarefa, conteudoArquivo);

      this.logger.log(`Arquivo id = ${tarefa.id} enviado`);
      await this.repository.update(
        { id: tarefa.id },
        { status: StatusEnvio.SUCESSO, retornoXml, requisicaoXml },
      );
    } catch (error: any) {
      this.logger.error(`Falha ao enviar arquivo id = ${tarefa.id}`, error);
      if (error instanceof IntegracaoSocException) {
        await this.repository.update(
          { id: tarefa.id },
          {
            status: StatusEnvio.ERRO,
            retornoXml: error.retornoXml,
            requisicaoXml: error.requisicaoXml,
          },
        );
      } else {
        await this.repository.update(
          { id: tarefa.id },
          { status: StatusEnvio.ERRO, retornoXml: error.message },
        );
      }
    }
  }
}
