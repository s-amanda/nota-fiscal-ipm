import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'TB_EXAME_SOC' })
export class ExameSoc {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id!: number;

  @Column({ name: 'sequencial_resultado', type: 'varchar' })
  sequencialResultado!: string;

  @Column({ name: 'codigo_interno_exame', type: 'varchar' })
  codigoInternoExame!: string;
}
