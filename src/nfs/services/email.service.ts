import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.servidorSmtp'),
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: this.configService.get<string>('email.username'),
        pass: this.configService.get<string>('email.password'),
      },
    });
  }

  async sendEmail(destinatario: string, anexo: Buffer, assunto: string) {
    // send mail with defined transport object
    await this.transporter.sendMail({
      from: this.configService.get<string>('email.username'),
      to: destinatario,
      subject: assunto,
      attachments: [
        {
          filename: 'notaFiscal.pdf',
          content: anexo,
        },
      ],
      //text: 'Hello world?',
    });
  }
}
