import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ItemNotaServico } from './item-nota-servico.entity';

@Entity({ name: 'TB_SERVICO' })
export class Servico {
  @PrimaryColumn({ name: 'SEQ_SER' })
  id!: number;

  @Column({ name: 'DES_SER' })
  descricao!: string;

  @OneToMany(() => ItemNotaServico, (item) => item.servico)
  itens!: ItemNotaServico[];
}
