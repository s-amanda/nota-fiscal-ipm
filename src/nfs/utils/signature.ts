import { SignedXml } from 'xml-crypto';

export function sign(xml: string, key: string, cert: string, element: string) {
  const sig = new SignedXml({
    privateKey: key,
    publicCert: cert,
    getKeyInfoContent: SignedXml.getKeyInfoContent,
    canonicalizationAlgorithm:
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
  });
  sig.addReference({
    xpath: `//*[local-name(.)='${element}']`,
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    isEmptyUri: true,
  });
  sig.computeSignature(xml, {
    location: {
      reference: `//*[local-name(.)='${element}']`,
      action: 'append',
    },
  });
  return sig.getSignedXml();
}
