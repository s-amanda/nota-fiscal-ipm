import { Column, ColumnOptions, Entity, PrimaryColumn } from 'typeorm';

export enum JobStatus {
  COMPLETED = '1',
  FAILED = '0',
}

@Entity({ name: 'TB_INT_SOC' })
export class Job {
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
  fileContent!: Buffer;

  @Column({ name: 'nomeArquivo', update: false })
  fileName!: string;

  @Column({ name: 'classificacao', update: false })
  classification!: string;

  @Column({ name: 'codigoSequencialFicha', update: false })
  sequenceNumber!: string;

  @Column({ name: 'codigoUsuario', update: false })
  userCode!: string;

  @Column({ name: 'chaveAcesso', update: false })
  accessKey!: string;

  @Column({ name: 'codigoEmpresaPrincipal', update: false })
  companyCode!: string;

  @Column({ name: 'codigoResponsavel', update: false })
  responsibleCode!: string;

  @Column({
    type: 'char',
  })
  status!: JobStatus | null;

  @Column({ name: 'retorno', type: 'text' })
  response!: string;
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
