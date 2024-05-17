import PDFDocument from 'pdfkit';
import { WritableStreamBuffer } from 'stream-buffers';

export async function imageToPdf(image: Buffer) {
  const document = new PDFDocument({ margin: 0 });
  document.image(image, 0, 0, {
    width: document.page.width,
  });
  const stream = new WritableStreamBuffer();
  document.pipe(stream);
  document.end();
  return new Promise<Buffer>((resolve, reject) => {
    stream.once('finish', () => {
      resolve(stream.getContents() as Buffer);
    });
    stream.once('error', reject);
  });
}
