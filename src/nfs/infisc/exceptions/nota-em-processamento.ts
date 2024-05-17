import { ClientError } from 'src/nfs/client/response';

export class NotaEmProcessamentoException extends ClientError {
  constructor(rawRequest: string, rawResponse: string) {
    super('Nota em processamento', rawRequest, rawResponse);
  }
}
