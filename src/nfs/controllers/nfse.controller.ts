import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { NotaFiscalService } from 'src/nfs/services/nfse.service';
import { MotivoCancelamento } from '../enums/motivo-cancelamento.enum';

@Controller('nfse')
export class NfseController {
  constructor(private nfseService: NotaFiscalService) {}
  @Post(':id')
  enviarNotaFiscal(@Param('id') id: string) {
    return this.nfseService.enviarNotaFiscal(Number(id));
  }

  @Get(':id/pdf')
  async gerarNotaFiscal(@Param('id') id: string) {
    return new StreamableFile(await this.nfseService.gerarPdf(Number(id)));
  }

  @Delete(':id')
  cancelarNotaFiscal(
    @Param('id') id: number,
    @Query('motivo') motivo: MotivoCancelamento,
  ) {
    return this.nfseService.cancelarNotaFiscal(id, motivo);
  }
}
