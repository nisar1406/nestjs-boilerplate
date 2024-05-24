import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailerService } from './mailer.service';

@Module({
  providers: [ConfigService, MailerService],
  exports: [MailerService],
})
export class MailerModule {}
