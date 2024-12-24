import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// import { appConfig, databaseConfig } from '../../configs';
import { DatabaseConfig } from '../config/database.config';
import { UserSeedModule } from './user/user-seed.module';

@Module({
  imports: [
    UserSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
  ],
})
export class SeedModule {}
