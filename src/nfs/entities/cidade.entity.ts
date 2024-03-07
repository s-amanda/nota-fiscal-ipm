import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Uf } from './uf.entity';

@Entity({ name: 'CIDADES' })
export class Cidade {
  @PrimaryColumn({ name: 'cod_cidade' })
  codigo!: number;

  @Column({ name: 'cod_uf' })
  codigoUf!: number;

  @Column({ name: 'descr_cidade' })
  descricao!: string;

  @Column({ name: 'COD_IBGE_CIDADE' })
  codigoIbge!: string;

  @JoinColumn({ name: 'cod_uf' })
  @ManyToOne(() => Uf, (uf) => uf.cidades)
  uf!: Uf;
}
