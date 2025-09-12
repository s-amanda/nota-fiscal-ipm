import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotaFiscal } from './entities/nota-fiscal.entity';
import { removeFormat } from './utils/formatador-cnpj-cpf';
import { NotaJaCanceladaException } from './exceptions/nota-ja-cancelada';
import format from 'date-fns/format';
import { generateAndSignXml } from './utils/assinatura';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { isAxiosError } from 'axios';
import { HistoricoNfseService } from './services/historico-nfse.service';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class NotaFiscalService {
  private logger = new Logger(NotaFiscalService.name);

  constructor(
    @InjectRepository(NotaFiscal)
    private notaFiscalRepository: Repository<NotaFiscal>,
    private historicoNfseService: HistoricoNfseService,
    private readonly httpService: HttpService,
  ) {}

  async emitirNfse(notaFiscalId: number) {
    const notaFiscal = await this.buscarNotaFiscal(notaFiscalId);
    // if (notaFiscal.notaFiscalSalva === 'S') {
    //   throw new BadRequestException('A nota fiscal já foi enviada');
    // }

    notaFiscal.numero = await this.buscarNumeroNotaEmpresa(notaFiscal);
    this.logger.log(`Gerando nota número ${notaFiscal.numero}`);

    const aliquotaIr = notaFiscal.aliquotaIr ?? 0;
    const aliquotaPis = notaFiscal.aliquotaPis ?? 0;
    const aliquotaCofins = notaFiscal.aliquotaCofins ?? 0;

    const empresa = notaFiscal.empresa;
    //const cnpj = removeFormat(empresa.cnpj);
    const cnpj = '1922311000170';

    const documentoTomador = removeFormat(notaFiscal.documentoTomador);

    const dadosXmlRequisicao = {
      nfse: {
        nfse_teste: '1',
        nf: {
          valor_total: notaFiscal.valorServico.toFixed(2).replace('.', ','),
          valor_desconto: '0',
          valor_ir: ((notaFiscal.valorServico * aliquotaIr) / 100)
            .toFixed(2)
            .replace('.', ','),
          valor_inss: '0',
          valor_contribuicao_social: '0',
          valor_rps: '0',
          valor_pis: ((notaFiscal.valorServico * aliquotaPis) / 100)
            .toFixed(2)
            .replace('.', ','),
          valor_cofins: ((notaFiscal.valorServico * aliquotaCofins) / 100)
            .toFixed(2)
            .replace('.', ','),
          observacao: notaFiscal.obsComplementar || '',
        },
        prestador: {
          cpfcnpj: cnpj,
          cidade: '8083', //número da cidade concórdia na receita federal
        },
        tomador: {
          tipo: documentoTomador.length === 11 ? 'F' : 'J',
          cpfcnpj: documentoTomador,
          ie: '',
          nome_razao_social: notaFiscal.nomeTomador,
          sobrenome_nome_fantasia: '',
          logradouro: notaFiscal.logradouro,
          email: notaFiscal.email,
          numero_residencia: notaFiscal.numeroEndereco,
          complemento: notaFiscal.complemento,
          ponto_referencia: '',
          bairro: notaFiscal.bairro,
          cidade: '8083', //é sempre concórdia?
          cep: String(notaFiscal.cep).replace(/-/g, '').trim(),
          ddd_fone_comercial: '',
          fone_comercial: notaFiscal.telefone,
          ddd_fone_residencial: '',
          fone_residencial: '',
          ddd_fax: '',
          fone_fax: '',
        },
        itens: notaFiscal.itens.map((item) => ({
          lista: {
            codigo_local_prestacao_servico: '8083', ///?????
            codigo_item_lista_servico: empresa.codigoLcServico,
            descritivo: item.descricao ?? item.servico.descricao,
            aliquota_item_lista_servico: '3', ///?????
            situacao_tributaria: '0',
            valor_tributavel: notaFiscal.valorServico
              .toFixed(2)
              .replace('.', ','),
            valor_deducao: '0',
            valor_issrf: '0',
            tributa_municipio_prestador: 'S',
            unidade_codigo: '1', ///?????
            unidade_quantidade: item.quantidade,
            unidade_valor_unitario: item.valorUnidade
              .toFixed(2)
              .replace('.', ','),
          },
        })),
      },
    };

    const xmlRequisicao = await generateAndSignXml(dadosXmlRequisicao);

    console.log(xmlRequisicao);

    const form = new FormData();
    form.append(
      'f1',
      new Blob([xmlRequisicao], { type: 'text/xml' }),
      '01922311000170_250905_164158.xml',
    );

    try {
      const { data: xmlResposta } = await firstValueFrom(
        this.httpService.post(
          `/atende.php?pg=rest&service=WNERestServiceNFSe&cidade=padrao`,
          form,
          {
            headers: {
              'content-type': 'multipart/form-data',
            },
            responseType: 'text',
            auth: { username: '01922311000170', password: '1234567' },
          },
        ),
      );
      const parser = new XMLParser({
        numberParseOptions: {
          hex: false,
          leadingZeros: false,
          eNotation: false,
        },
      });
      const resposta = parser.parse(xmlResposta);

      const idRetornoNota = String(resposta.retorno.numero_nfse);
      const chaveAcesso = resposta.retorno.cod_verificador_autenticidade;

      await this.historicoNfseService.gravarHistorico(
        notaFiscal,
        xmlRequisicao,
        true,
        idRetornoNota,
        chaveAcesso,
      );
      await this.historicoNfseService.gravarHistorico(
        notaFiscal,
        xmlResposta,
        true,
        idRetornoNota,
        chaveAcesso,
      );

      await this.notaFiscalRepository.update(
        { id: notaFiscalId },
        {
          notaFiscalSalva: 'S',
          notaFiscalImpressa: 'S',
          numero: notaFiscal.numero,
          sucesso: 'S',
          numeroLote: notaFiscal.numero,
          numeroRps: notaFiscal.numero,
          numeroLoteRps: String(notaFiscalId),
          linkNotaIpM: resposta.retorno.link_nfse,
        },
      );
      this.logger.log(`Nota gerada com sucesso`);

      return { idRetornoNota };
    } catch (error) {
      if (!isAxiosError(error)) {
        this.logger.error(`Erro ao gerar nota: ${error}`);
        throw error;
      }
      this.logger.error(`Erro ao gerar nota: ${error.response?.data}`);
      await this.historicoNfseService.gravarHistorico(
        notaFiscal,
        xmlRequisicao,
        false,
        null,
        null,
      );
      await this.historicoNfseService.gravarHistorico(
        notaFiscal,
        error.response?.data,
        false,
        null,
        null,
      );
      await this.notaFiscalRepository.update(
        { id: notaFiscalId },
        { sucesso: 'N' },
      );
      throw error;
    }
  }

  async cancelarNotaFiscal(id: number, motivo: string) {
    const notaFiscal = await this.buscarNotaFiscal(id);
    if (notaFiscal.notaFiscalImpressa === 'A') {
      throw new NotaJaCanceladaException();
    }

    await this.notaFiscalRepository.update(
      { id },
      {
        dataCancelamento: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        notaFiscalImpressa: 'A',
      },
    );
    const dadosXml = {
      nfse: {
        nfse_teste: '1',
        nf: {
          numero: id,
          situacao: 'C',
          observacao: motivo || '',
        },
        prestador: {
          //cpfcnpj: notaFiscal.empresa.cnpj,
          cpfcnpj: '1922311000170',
          cidade: '8083', //número da cidade concórdia na receita federal
        },
      },
    };

    const xmlRequisicao = await generateAndSignXml(dadosXml);

    const form = new FormData();
    form.append('f1', xmlRequisicao);

    await firstValueFrom(
      this.httpService.post(
        `/atende.php?pg=rest&service=WNERestServiceNFSe&cidade=padrao`,
        form,
        { responseType: 'text' },
      ),
    );

    await this.notaFiscalRepository.update(
      { id },
      {
        dataCancelamento: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        notaFiscalImpressa: 'A',
      },
    );
  }

  private async buscarNotaFiscal(id: number) {
    const [notaFiscal] = await this.notaFiscalRepository.find({
      where: { id },
      relations: ['itens', 'empresa', 'pessoa'],
    });
    if (!notaFiscal) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }

    return notaFiscal;
  }

  private async buscarNumeroNotaEmpresa(notaFiscal: NotaFiscal) {
    const idEmpresa = notaFiscal.empresa.id;

    const { numero } = await this.notaFiscalRepository
      .createQueryBuilder('notaFiscal')
      .select('MAX(notaFiscal.numero)', 'numero')
      .innerJoin('notaFiscal.empresa', 'empresa')
      .where('empresa.id = :idEmpresa', { idEmpresa })
      .andWhere(
        `(notaFiscal.notaFiscalImpressa = 'S' or notaFiscal.notaFiscalImpressa = 'A')`,
      )
      .andWhere('notaFiscal.numeroLote is not null')
      .getRawOne();

    return (numero + 1) as number;
  }
}
