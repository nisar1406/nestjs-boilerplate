import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from '../../model';
import { USERS } from '../../utils/constants/model-names';
import { LoggerService } from '../logger/logger.service';
import { BackupService } from './backup.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: USERS,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [BackupService, ConfigService, LoggerService],
  exports: [BackupService],
})
export class BackupModule {}
