import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { NotaFiscal } from './nota-fiscal.entity';
import { Servico } from './servico.entity';

@Entity({ name: 'TB_ITEM_NOTA_SERVICO' })
export class ItemNotaServico {
  @PrimaryColumn({ name: 'SEQ_SER' })
  id!: number;

  @Column({ name: 'SEQ_NOTFIS' })
  idNotaFiscal!: number;

  @Column({ name: 'DES_SERVICO_ITENOTSER', type: 'varchar' })
  descricao!: string | null;

  @Column({ name: 'QTD_ITENOTSER', type: 'numeric' })
  quantidade!: number;

  @Column({ name: 'VLR_ITENOTSER', type: 'numeric' })
  valorUnidade!: number;

  @Column({ name: 'VLR_TOTAL_ITENOTSER', type: 'numeric' })
  valorTotal!: number;

  @Column({ name: 'PER_ISS_ITENOTSER', type: 'numeric' })
  percentualIss!: number;

  @Column({ name: 'VLR_ISS_ITENOTSER', type: 'numeric' })
  valorIss!: number;

  @Column({ name: 'FLG_TEM_IRRF_ITENOTSER' })
  irrf!: boolean;

  @JoinColumn({ name: 'SEQ_NOTFIS' })
  @ManyToOne(() => NotaFiscal, (notaFiscal) => notaFiscal.itens)
  notaFiscal!: NotaFiscal;

  @JoinColumn({ name: 'SEQ_SER' })
  @ManyToOne(() => Servico, (servico) => servico.itens)
  servico!: Servico;
}
