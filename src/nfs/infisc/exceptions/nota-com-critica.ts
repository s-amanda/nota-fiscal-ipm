import { ClientError } from 'src/nfs/client/response';

export class NotaComCriticaException extends ClientError {
  constructor(motivos: string[], rawRequest: string, rawResponse: string) {
    super(motivos.join('\n'), rawRequest, rawResponse);
  }
}
