import { Column, ColumnOptions, Entity, PrimaryColumn } from 'typeorm';

export enum StatusEnvio {
  SUCESSO = '1',
  ERRO = '0',
}

@Entity({ name: 'TB_INT_SOC' })
export class TarefaEnvioSoc {
  @PrimaryColumn()
  id!: number;

  @Column({
    name: 'arquivo',
    type: 'text',
    select: false,
    update: false,
    transformer: {
      from: (base64: string) => Buffer.from(base64, 'base64'),
    },
  } as ColumnOptions)
  conteudoArquivo!: Buffer;

  @Column({ name: 'nomeArquivo', update: false })
  nomeArquivo!: string;

  @Column({ name: 'classificacao', update: false })
  classificacao!: string;

  @Column({ name: 'codigoSequencialFicha', update: false })
  codigoSequencialFicha!: string;

  @Column({ name: 'codigoUsuario', update: false })
  codigoUsuario!: string;

  @Column({ name: 'chaveAcesso', update: false })
  chaveAcesso!: string;

  @Column({ name: 'codigoEmpresaPrincipal', update: false })
  codigoEmpresaPrincipal!: string;

  @Column({ name: 'codigoResponsavel', update: false })
  codigoResponsavel!: string;

  @Column({ name: 'codigo_pedido', type: 'int' })
  codigoPedido!: number;

  @Column({ name: 'posto_pedido', type: 'char' })
  postoPedido!: string;

  @Column({
    type: 'char',
  })
  status!: StatusEnvio | null;

  @Column({ name: 'requisicao', type: 'text' })
  requisicaoXml!: string;

  @Column({ name: 'retorno', type: 'text' })
  retornoXml!: string;
}

// create table TB_INT_SOC(
//   id INT IDENTITY(1, 1),
//   codigo_pedido int not null,
//   posto_pedido char(2) not null,
//   arquivo text,
//   classificacao varchar(20),
//   codigoSequencialFicha varchar(20),
//   nomeArquivo varchar(200),
//   data_geracao datetime,
//   data_envio datetime,
//   status char(1),
//   retorno text
// );
