import { InternalServerErrorException } from '@nestjs/common';

export class ClientResponse<T> {
  constructor(
    public readonly data: T,
    public readonly rawRequest: string,
    public readonly rawResponse: string,
  ) {}
}

export class ClientError extends InternalServerErrorException {
  constructor(
    public readonly message: string,
    public readonly rawRequest: string,
    public readonly rawResponse: string,
  ) {
    super(message);
  }
}
