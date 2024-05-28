import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

import { AllConfigType } from '../../configs/config.type';

@Injectable()
export class DatabaseConfig implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}
  createMongooseOptions(): MongooseModuleOptions {
    // Retrieve database connection URI and other options from environment variables
    const username = this.configService.getOrThrow<string>(
      'database.username',
      {
        infer: true,
      },
    );
    const password = this.configService.getOrThrow<string>(
      'database.password',
      {
        infer: true,
      },
    );
    const host = this.configService.getOrThrow<string>('database.host', {
      infer: true,
    });
    const database = this.configService.getOrThrow<string>('database.name', {
      infer: true,
    });
    return {
      uri: `mongodb+srv://${username}:${password}@${host}/${database}`,
    };
  }
}
