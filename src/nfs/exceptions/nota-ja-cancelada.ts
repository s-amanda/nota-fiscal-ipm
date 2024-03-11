import { BadRequestException } from '@nestjs/common';

export class NotaJaCanceladaException extends BadRequestException {
  constructor() {
    super('Essa nota já está cancelada');
  }
}
