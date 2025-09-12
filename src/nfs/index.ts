import { Crypto } from '@peculiar/webcrypto';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { XMLBuilder } from 'fast-xml-parser';
import * as fs from 'fs';
// Import node-forge differently for ES modules
import forge from 'node-forge';
import * as XmlDSigJs from 'xmldsigjs';

// Setup WebCrypto polyfill
const crypto = new Crypto();
XmlDSigJs.Application.setEngine('OpenSSL', crypto);

// Set DOM dependencies for xmldsigjs
import { setNodeDependencies } from 'xml-core';

setNodeDependencies({
  DOMParser,
  XMLSerializer,
});

// XML data structure matching the required XML
const xmlData = {
  nfse: {
    nfse_teste: '1',
    nf: {
      valor_total: '89,5',
      valor_desconto: '0',
      valor_ir: '0',
      valor_inss: '0',
      valor_contribuicao_social: '0',
      valor_rps: '0',
      valor_pis: '0',
      valor_cofins: '0',
      observacao: 'Pedido 227047-02',
    },
    prestador: {
      cpfcnpj: '1922311000170',
      cidade: '8083',
    },
    tomador: {
      tipo: 'F',
      cpfcnpj: '07911875944',
      ie: '',
      nome_razao_social: 'Amanda Bach Bauer',
      sobrenome_nome_fantasia: '',
      logradouro: 'RICARDO JOAO ANGONESES',
      email: '',
      numero_residencia: '163',
      complemento: '163',
      ponto_referencia: '',
      bairro: 'Gruta',
      cidade: '8083',
      cep: '89705228',
      ddd_fone_comercial: '',
      fone_comercial: '',
      ddd_fone_residencial: '',
      fone_residencial: '',
      ddd_fax: '',
      fone_fax: '',
    },
    itens: {
      lista: {
        codigo_local_prestacao_servico: '8083',
        codigo_item_lista_servico: '403',
        descritivo: 'Exames de laboratórios',
        aliquota_item_lista_servico: '3',
        situacao_tributaria: '0',
        valor_tributavel: '89,5',
        valor_deducao: '0',
        valor_issrf: '0',
        tributa_municipio_prestador: 'S',
        unidade_codigo: '1',
        unidade_quantidade: '1',
        unidade_valor_unitario: '89,5',
      },
    },
  },
};

async function loadPfxCertificate(pfxPath: string, password: string) {
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

async function generateAndSignXml() {
  try {
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

    console.log('Signed XML:');
    console.log(signedXmlString);

    // Save both versions to files
    fs.writeFileSync('unsigned.xml', xmlString, 'utf8');
    fs.writeFileSync('signed.xml', signedXmlString, 'utf8');

    console.log('\nFiles saved:');
    console.log('- unsigned.xml: Original XML without signature');
    console.log('- signed.xml: XML with digital signature');
  } catch (error) {
    console.error('Error generating or signing XML:', error);
  }
}

// Run the script
generateAndSignXml();
