import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class EmailAdapter {
  private readonly logger = new Logger(EmailAdapter.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('SMTP_HOST', 'localhost'),
      port: configService.get<number>('SMTP_PORT', 587),
      secure: configService.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: configService.get<string>('SMTP_USER', ''),
        pass: configService.get<string>('SMTP_PASS', ''),
      },
    });
  }

  async send(message: EmailMessage): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM', 'Sentinel <no-reply@sentinel.local>');

    await this.transporter.sendMail({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    this.logger.log(`Email sent to ${message.to}: ${message.subject}`);
  }
}
