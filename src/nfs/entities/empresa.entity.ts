import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { NotaFiscal } from './nota-fiscal.entity';

@Entity({ name: 'TB_EMPRESA' })
export class Empresa {
  @PrimaryColumn({ name: 'SEQ_EMPRESA' })
  id!: number;

  @Column({ name: 'NOM_RAZAO_SOCIAL_EMPRESA' })
  nome!: string;

  @Column({ name: 'SerieRPS', type: 'varchar' })
  serie!: string | null;

  @Column({ name: 'CNJP' })
  cnpj!: string;

  @Column({ name: 'INSCMUN' })
  inscricaoMunicipal!: string;

  @Column({ name: 'ENDERECO' })
  logradouro!: string;

  @Column({ name: 'NUM_ENDERECO' })
  numeroEndereco!: number;

  @Column({ name: 'NOM_BAIRRO' })
  bairro!: string;

  @Column({ name: 'CIDADE' })
  cidade!: string;

  @Column({ name: 'COMPLEMENTO_ENDERECO', type: 'varchar' })
  complemento!: string | null;

  @Column({ name: 'COD_CIDADE' })
  codigoCidade!: number;

  @Column({ name: 'INSCEST' })
  incricaoEstadual!: string;

  @Column({ name: 'UF' })
  uf!: string;

  @Column()
  cep!: string;

  @Column({ name: 'EMAIL_COMPRAS_EMP' })
  email!: string;

  @Column()
  fone!: string;

  @Column({ name: 'OptanteSimplesNacional' })
  simplesNacional!: string;

  @Column({ name: 'COD_ITEM_SERV_NFE' })
  codigoServico!: string;

  @Column({ name: 'COD_ITEM_SERV_LC_NFE' })
  codigoLcServico!: string;

  @Column({ name: 'COD_ITEM_TRIB_MUNI_NFE' })
  codigoMunicipioTributacao!: string;

  @Column({ name: 'PER_ALIQUOTA_ISS_NFE', type: 'numeric' })
  aliquotaIss!: number;

  @Column({ name: 'NUM_RPS_EMP' })
  numeroRps!: number;

  @Column({ name: 'NaturezaOperacao' })
  naturezaOperacao!: number;

  @OneToMany(() => NotaFiscal, (nota) => nota.empresa)
  notasFiscais!: NotaFiscal[];

  //   @Column({ name: 'COD_ITEM_SERV_LC_NFE' })
  //   codigoLcItem!: string;
}
