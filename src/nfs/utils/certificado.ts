import * as fs from 'fs';
import forge from 'node-forge';

export async function loadPfxCertificate(pfxPath: string, password: string) {
  try {
    // Read the PFX file
    const pfxData = fs.readFileSync(pfxPath);

    // Parse the PFX using node-forge
    const p12Asn1 = forge.asn1.fromDer(pfxData.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    // Extract the private key and certificate
    const keyBagType = forge.pki.oids.pkcs8ShroudedKeyBag as string;
    const certBagType = forge.pki.oids.certBag as string;

    const bags = p12.getBags({ bagType: keyBagType });
    const keyBag = bags[keyBagType]?.[0];

    if (!keyBag) {
      throw new Error('No private key found in PFX file');
    }

    const certBags = p12.getBags({ bagType: certBagType });
    const certBag = certBags[certBagType]?.[0];

    if (!certBag) {
      throw new Error('No certificate found in PFX file');
    }

    const privateKey = keyBag.key;
    const certificate = certBag.cert;

    if (!privateKey || !certificate) {
      throw new Error('Failed to extract key or certificate from PFX');
    }

    // Convert to proper PKCS8 format using forge
    const pkcs8 = forge.pki.wrapRsaPrivateKey(
      forge.pki.privateKeyToAsn1(privateKey),
    );
    const pkcs8Der = forge.asn1.toDer(pkcs8).getBytes();

    // Convert to ArrayBuffer
    const keyArrayBuffer = new ArrayBuffer(pkcs8Der.length);
    const keyView = new Uint8Array(keyArrayBuffer);
    for (let i = 0; i < pkcs8Der.length; i++) {
      keyView[i] = pkcs8Der.charCodeAt(i);
    }

    return {
      privateKeyBuffer: keyArrayBuffer,
      certificatePem: forge.pki.certificateToPem(certificate),
    };
  } catch (error) {
    console.error('Error loading PFX certificate:', error);
    throw error;
  }
}
