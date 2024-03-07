import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3010);
  // const nfseService = app.get(NfseService);

  // console.log(JSON.stringify(await nfseService.enviarNotaFiscal(1), null, 2));
  // const pdf = await nfseService.getPdf(
  //   '92860667000263',
  //   '43928606670002639800S000003676131949447',
  // );
  // fs.writeFile('output.pdf', pdf);
}
bootstrap();
