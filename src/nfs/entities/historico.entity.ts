import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { NotaFiscal } from './nota-fiscal.entity';

@Entity({ name: 'TB_HISTORICO_NFE' })
export class Historico {
  @PrimaryColumn({ name: 'SEQ_HISTNFE', type: 'int' })
  id!: number | null;

  @Column({ name: 'SEQ_NOTFIS' })
  idNotaFiscal!: number;

  @Column({ name: 'DTH_HISTNFE' })
  data!: Date;

  @Column({ name: 'XML_HISTNFE' })
  xml!: string;

  @Column({ name: 'SEQ_LOVSTATNFE' })
  status!: number;

  @Column({ name: 'USERNAME' })
  user!: string;

  @Column({ name: 'NUM_PROT_HISTNFE' })
  protocolo!: string;

  @Column({ name: 'NUM_CHAVE_ACESSO' })
  chaveAcesso!: string;

  @JoinColumn({ name: 'SEQ_NOTFIS' })
  @ManyToOne(() => NotaFiscal, (notaFiscal) => notaFiscal.historicos)
  notaFiscal!: NotaFiscal;
}
