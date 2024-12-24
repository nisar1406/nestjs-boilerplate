import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseConfig } from './config/database.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
  ],
  providers: [DatabaseConfig],
  exports: [DatabaseConfig],
})
export class DatabaseModule {}
