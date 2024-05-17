import { SignedXml } from 'xml-crypto';

interface SignXmlOptions {
  xml: string;
  privateKey: string;
  certificate: string;
  signedElement: string;
  signatureLocation: 'append' | 'after';
  isEmptyUri?: boolean;
}

export function signXml({
  xml,
  privateKey,
  certificate,
  signedElement,
  signatureLocation,
  isEmptyUri = true,
}: SignXmlOptions) {
  const sig = new SignedXml({
    privateKey,
    publicCert: certificate,
    getKeyInfoContent: SignedXml.getKeyInfoContent,
    canonicalizationAlgorithm:
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
  });
  sig.addReference({
    xpath: `//*[local-name(.)='${signedElement}']`,
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    isEmptyUri,
  });
  sig.computeSignature(xml, {
    location: {
      reference: `//*[local-name(.)='${signedElement}']`,
      action: signatureLocation,
    },
  });
  return sig.getSignedXml();
}
