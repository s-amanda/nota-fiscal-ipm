// import { Injectable } from '@nestjs/common';
// import axios from 'axios';
// import fs from 'fs';
// import { create } from 'xmlbuilder2';
// import { getKeyFromCertificate } from '../utils/certificate';
// import { sign } from '../utils/signature';

// @Injectable()
// export class SignatureService {
//   generateNfsXml() {
//     const id = {
//       'cNFS-e': 131949447,
//       mod: 98,
//       serie: 'S',
//       'nNFS-e': 104702,
//       dEmi: '2023-12-21',
//       hEmi: '17:34',
//       tpNF: 1,
//       refNF: '43928606670001829800S000104702131949447',
//       tpEmis: 'N',
//       cancelada: 'N',
//       canhoto: 0,
//       ambienteEmi: 1,
//       formaEmi: 2,
//       empreitadaGlobal: 2,
//     };

//     const prest = {
//       CNPJ: 92860667000263,
//       xNome: 'Alfa Laboratorio Ltda',
//       xFant: '',
//       IM: 6074,
//       xEmail: 'alfa@alfalaboratorio.com.br',
//       end: {
//         xLgr: 'Av. Julio de Castilhos',
//         nro: 1614,
//         xBairro: 'Centro',
//         cMun: 4305108,
//         xMun: 'Caxias Do Sul',
//         UF: 'RS',
//         CEP: 95010001,
//         cPais: 1058,
//         xPais: 'BRASIL',
//       },
//       fone: 5432903000,
//       IE: '',
//       regimeTrib: 3,
//     };

//     const tomS = {
//       CPF: 92034179072,
//       xNome: 'Robison Pereira',
//       ender: {
//         xLgr: 'Rua Sao Jeronimo',
//         nro: 183,
//         xCpl: '',
//         xBairro: 'Vera Cruz',
//         cMun: 4309209,
//         xMun: 'Gravatai',
//         UF: 'RS',
//         CEP: 94090100,
//         cPais: 1058,
//         xPais: 'BRASIL',
//       },
//       xEmail: 'robisondtp@gmail.com',
//       IE: '',
//       IM: '',
//     };

//     const det = {
//       nItem: 1,
//       serv: {
//         cServ: 508,
//         cLCServ: '0403',
//         xServ: 'Exames Realizados cod. 4.02',
//         localTributacao: 4305108,
//         localVerifResServ: 1,
//         uTrib: 'UN',
//         qTrib: 1.0,
//         vUnit: 1.0,
//         vServ: 1.0,
//         vDesc: 0.0,
//         vBCISS: 1.0,
//         pISS: 2.0,
//         vISS: 0.02,
//         vRed: 0.0,
//       },
//     };

//     const total = {
//       vServ: 1,
//       vDesc: 0,
//       vtNF: 1,
//       vtLiq: 1,
//       totalAproxTrib: 0,
//       vtLiqFaturas: 1,
//       ISS: {
//         vBCISS: 1,
//         vISS: 0.02,
//       },
//     };

//     const faturas = {
//       fat: {
//         nItem: 1,
//         nFat: 1,
//         dVenc: '2023-12-21',
//         vFat: 1,
//       },
//     };

//     const envioLote = {
//       '@versao': '1.0',
//       CNPJ: 92860667000263,
//       dhTrans: '2024-01-24 17:41:56',
//       'NFS-e': {
//         infNFSe: {
//           '@versao': '1.1',
//           Id: id,
//           prest: prest,
//           TomS: tomS,
//           det: det,
//           total: total,
//           faturas: faturas,
//           infAdicLT: 4305108,
//           infAdic:
//             'Valor Aproximado de Tributos: Federais: R$ 0,13 (13,45%) Municipais: R$ 0,02 (2,09%) - Fonte: IBPT/FECOMERCIO RS',
//         },
//       },
//     };

//     const doc = create({ envioLote });
//     const xml = doc.end({ prettyPrint: true, headless: true });

//     const p12buffer = fs.readFileSync('certificadoalfa.pfx', 'base64');

//     const { cert, key } = getKeyFromCertificate(p12buffer);

//     const signed = sign(xml, key, cert);

//     const signedXml = {
//       'soapenv:Envelope': {
//         '@xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
//         '@xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
//         '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
//         'soapenv:Body': {
//           'ns1:enviarLoteNotas': {
//             '@soapenv:encodingStyle':
//               'http://schemas.xmlsoap.org/soap/encoding/',
//             '@xmlns:ns1': 'http://ws.pc.gif.com.br/',
//             xml: signed,
//           },
//         },
//       },
//     };

//     const requestXml = create(signedXml).end({ prettyPrint: true });

//     fs.writeFileSync('request.xml', requestXml);

//     axios({
//       method: 'post',
//       url: 'https://nfsehomol.caxias.rs.gov.br/portal/Servicos',
//       data: Buffer.from(requestXml),
//       headers: { 'Content-Type': false },
//     }).then(({ data }) => fs.writeFileSync('response.xml', data as string));
//   }
// }
