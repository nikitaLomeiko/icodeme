import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import emailConfig from '@core/config/email/email.config';
import { EmailOptions } from '../types';

@Injectable()
export class EmailService implements OnApplicationShutdown {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor() {
    const email = emailConfig().email;
    this.from = email.from;
    this.transporter = nodemailer.createTransport({
      host: email.host,
      port: email.port,
      secure: email.secure,
      auth: {
        user: email.user,
        pass: email.password,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }

  onApplicationShutdown(): void {
    this.transporter.close();
  }
}
