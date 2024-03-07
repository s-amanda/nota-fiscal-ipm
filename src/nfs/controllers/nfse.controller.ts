import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { NotaFiscalService } from 'src/nfs/services/nfse.service';

@Controller('nfse')
export class NfseController {
  constructor(private nfseService: NotaFiscalService) {}
  @Post(':id')
  enviarNotaFiscal(@Param('id') id: string) {
    return this.nfseService.enviarNotaFiscal(Number(id));
  }

  // @Get(':id')
  // consultarNotaFiscal(@Param('id') id: number) {
  //   // id => recebe string e converte pra numero
  //   return this.nfseService.consultarNotaFiscal(id);
  // }

  @Get(':id/pdf')
  async gerarNotaFiscal(@Param('id') id: number) {
    return new StreamableFile(await this.nfseService.gerarPdf(id));
  }

  @Delete(':id')
  cancelarNotaFiscal(@Param('id') id: number) {
    return this.nfseService.cancelarNotaFiscal(id);
  }
}
