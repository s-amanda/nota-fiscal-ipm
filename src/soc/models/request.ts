interface FileProperties {
  name: string;
  type: string;
  content: Buffer;
}

export interface FileRequest {
  file: FileProperties;
  classification: string;
  sequenceNumber: string;
  accessKey: string;
  userCode: string;
  companyCode: string;
  responsibleCode: string;
}
