interface FileProperties {
  name: string;
  type: string;
  content: Buffer;
}

export interface FileRequest {
  file: FileProperties;
  classification: string;
  sequenceNumber: string;
}
