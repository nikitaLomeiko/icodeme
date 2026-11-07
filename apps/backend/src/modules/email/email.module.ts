import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from '@services/emailService';
import emailConfig from '@core/config/email/email.config';

const email = emailConfig().email;

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: email.host,
        port: email.port,
        secure: email.secure,
        auth: {
          user: email.user,
          pass: email.password,
        },
      },
      defaults: {
        from: email.from,
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
