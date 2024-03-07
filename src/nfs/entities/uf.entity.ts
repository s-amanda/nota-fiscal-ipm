import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Cidade } from './cidade.entity';

@Entity({ name: 'UF' })
export class Uf {
  @PrimaryColumn({ name: 'COD_UF' })
  codigo!: number;

  @Column({ name: 'UF' })
  uf!: string;

  @OneToMany(() => Cidade, (cidade) => cidade.uf)
  cidades!: Cidade[];
}
