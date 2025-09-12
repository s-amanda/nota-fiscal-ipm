import { XMLBuilder } from 'fast-xml-parser';
import * as XmlDSigJs from 'xmldsigjs';
import { loadPfxCertificate } from './certificado';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { setNodeDependencies } from 'xml-core';
import { Crypto } from '@peculiar/webcrypto';

const crypto = new Crypto();
XmlDSigJs.Application.setEngine('OpenSSL', crypto);

setNodeDependencies({
  DOMParser,
  XMLSerializer,
});

export async function generateAndSignXml(xmlData: any) {
  // Configure XML builder options
  const options = {
    format: true,
    ignoreAttributes: false,
    suppressEmptyNode: true,
  };

  // Create XML builder
  const builder = new XMLBuilder(options);

  // Generate XML without declaration first
  const xmlContent = builder.build(xmlData);

  // Add XML declaration manually with ISO-8859-1 encoding
  const xmlString = `<?xml version="1.0" encoding="ISO-8859-1"?>\n${xmlContent}`;

  // Load the certificate and private key from PFX
  const { privateKeyBuffer } = await loadPfxCertificate(
    'LAB ANALIC LTDA (2).pfx',
    '123456',
  );

  // Parse the XML for signing
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // Import the private key for WebCrypto using the properly formatted PKCS8 buffer
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  // Create XML signature
  const xmlSignature = new XmlDSigJs.SignedXml();

  // Set the signing key and sign the document
  await xmlSignature.Sign(
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    privateKey,
    xmlDoc,
    {
      references: [{ hash: 'SHA-256', transforms: ['enveloped'] }],
    },
  );

  // Add signature to the original document
  const signature = xmlSignature.GetXml();
  if (!signature) {
    throw new Error('Failed to generate signature');
  }

  // Append signature to the original document
  const rootElement = xmlDoc.documentElement;
  rootElement.appendChild(signature);

  // Serialize the signed XML
  const serializer = new XMLSerializer();
  const signedXmlString = serializer.serializeToString(xmlDoc);

  return signedXmlString;
}
