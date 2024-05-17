import { ClientError } from 'src/nfs/client/response';

export class NotaNaoProcessadaException extends ClientError {
  constructor(rawRequest: string, rawResponse: string) {
    super('Nota não processada', rawRequest, rawResponse);
  }
}
