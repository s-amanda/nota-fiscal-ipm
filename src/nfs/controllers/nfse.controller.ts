import { Controller, Delete, Param, Post, Query } from '@nestjs/common';
import { NotaFiscalService } from '../nfse.service';

@Controller('nfse')
export class NfseController {
  constructor(private nfseService: NotaFiscalService) {}
  @Post(':id')
  enviarNotaFiscal(@Param('id') id: string) {
    return this.nfseService.emitirNfse(Number(id));
  }

  @Delete(':id')
  cancelarNotaFiscal(@Param('id') id: number, @Query('motivo') motivo: string) {
    return this.nfseService.cancelarNotaFiscal(id, motivo);
  }
}
