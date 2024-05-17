import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Empresa } from './empresa.entity';
import { Historico } from './historico.entity';
import { ItemNotaServico } from './item-nota-servico.entity';
import { Pessoa } from './pessoa.entity';

@Entity({ name: 'TB_NOTA_FISCAL' })
export class NotaFiscal {
  @PrimaryColumn({ name: 'SEQ_NOTFIS' })
  id!: number;

  @Column({ name: 'NUM_NOTFIS_SERV' })
  numero!: number;

  @Column({ name: 'SEQ_EMPRESA' })
  idEmpresa!: number;

  @Column({ name: 'VLR_TOTAL_NOTFIS', type: 'numeric' })
  valorTotalLiquido!: number;

  @Column({ name: 'CPF_CNPJ_NOTFIS' })
  documentoTomador!: string;

  @Column({ name: 'NOM_PES_NOTFIS' })
  nomeTomador!: string;

  // @Column({ name: 'NOM_RAZAO_PES' })
  // razaoSocialTomador!: string;

  @Column({ name: 'DES_ENDERECO_NOTFIS' })
  logradouro!: string;

  @Column({ name: 'NUM_END_NOTFIS' })
  numeroEndereco!: string;

  @Column({ name: 'DES_COMPL_END_NOTFIS', type: 'varchar' })
  complemento!: string | null;

  @Column({ name: 'DES_BAIRRO_NOTFIS' })
  bairro!: string;

  @Column({ name: 'NOM_CIDADE_NOTFIS' })
  cidade!: string;

  @Column({ name: 'SIG_UF_NOTFIS' })
  uf!: string;

  @Column({ name: 'NUM_CEP_NOTFIS' })
  cep!: number;

  @Column({ name: 'VLR_TOTAL_MERCADORIA_NOTFIS', type: 'numeric' })
  valorServico!: number;

  @Column({ name: 'VLR_ISS_NOTFIS', type: 'numeric' })
  valorIss!: number | null;

  @Column({ name: 'PER_ALIQUOTA_ISS_NOTFIS', type: 'numeric' })
  aliquotaIss!: number | null;

  @Column({ name: 'PER_ALIQUOTA_PIS_NOTFIS', type: 'numeric' })
  aliquotaPis!: number | null;

  @Column({ name: 'PER_ALIQUOTA_CSSL_NOTFIS', type: 'numeric' })
  aliquotaCsll!: number | null;

  @Column({ name: 'PER_ALIQUOTA_COFINS_NOTFIS', type: 'numeric' })
  aliquotaCofins!: number | null;

  @Column({ name: 'PER_ALIQUOTA_IRRF_NOTFIS', type: 'numeric' })
  aliquotaIr!: number | null;

  @Column({ name: 'FLG_SALVA_NOTFIS' })
  notaFiscalSalva!: string;

  @Column({ name: 'FLG_IMPRESSA_NOTFIS' })
  notaFiscalImpressa!: string;

  @Column({ name: 'NUM_LOTE_NOTFIS' })
  numeroLote!: number;

  @Column({ name: 'NUM_RPS_NOTFIS' })
  numeroRps!: number;

  @Column({ name: 'FLG_SUCESSO_NF' })
  sucesso!: string;

  @Column({ name: 'DTH_CANCELADA' })
  dataCancelamento!: Date;

  @Column({ name: 'NUM_TELEFONE_NOTFIS' })
  telefone!: string;

  @Column({ name: 'END_EMAIL_PES' })
  email!: string;

  @Column({ name: 'NaturezaOperacao' })
  naturezaOperacao!: number;

  @Column({ name: 'VLR_PIS_NOTFIS' })
  valorPis!: number;

  @Column({ name: 'VLR_COFINS_NOTFIS' })
  valorCofins!: number;

  @Column({ name: 'VLR_IRRF_NOTFIS' })
  valorIrrf!: number;

  @Column({ name: 'VLR_CSSL_NOTFIS' })
  valorCsll!: number;

  @Column({ name: 'NUM_LOTE_RPS' })
  numeroLoteRps!: string;

  @Column({ name: 'OBS_COMPLEMENTAR_NOTFIS' })
  obsComplementar!: string;

  @OneToMany(() => ItemNotaServico, (item) => item.notaFiscal)
  itens!: ItemNotaServico[];

  @JoinColumn({ name: 'SEQ_EMPRESA' })
  @ManyToOne(() => Empresa, (empresa) => empresa.notasFiscais)
  empresa!: Empresa;

  @JoinColumn({ name: 'SEQ_PES' })
  @ManyToOne(() => Pessoa, (pessoa) => pessoa.notasFiscais)
  pessoa!: Pessoa;

  @OneToMany(() => Historico, (historico) => historico.notaFiscal)
  historicos!: Historico[];
}
