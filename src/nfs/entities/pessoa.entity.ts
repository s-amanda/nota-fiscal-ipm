import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { NotaFiscal } from './nota-fiscal.entity';

@Entity({ name: 'TB_PESSOA' })
export class Pessoa {
  @PrimaryColumn({ name: 'SEQ_PES' })
  id!: number;

  @Column({ name: 'FLG_TIPO_PES' })
  tipoPessoa!: string;

  @Column({ name: 'INSCEST_PES' })
  inscricaoEstadual!: string;

  @OneToMany(() => NotaFiscal, (notaFiscal) => notaFiscal.pessoa)
  notasFiscais!: NotaFiscal[];
}
