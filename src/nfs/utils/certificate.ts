/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import forge from 'node-forge';

// const p12buffer = fs.readFileSync('certificadoalfa.pfx', 'base64');

export function getKeyFromCertificate(p12buffer: string) {
  const p12Der = forge.util.decode64(p12buffer);
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, true, '32903000');
  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
    forge.pki.oids.pkcs8ShroudedKeyBag!
  ]!;
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[
    forge.pki.oids.certBag!
  ]!;
  const key = forge.pki.privateKeyInfoToPem(
    forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(keyBags[0]!.key!)),
  );
  const cert = forge.pki.certificateToPem(certBags[0]!.cert!);
  return { key, cert };
}
