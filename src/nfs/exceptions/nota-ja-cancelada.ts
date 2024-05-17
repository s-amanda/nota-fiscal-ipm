import { BadRequestException } from '@nestjs/common';

export class NotaJaCanceladaException extends BadRequestException {
  constructor() {
    super('Nota já está cancelada');
  }
}
