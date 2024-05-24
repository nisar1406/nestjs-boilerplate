import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { LoggerService } from './services/logger/logger.service';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly loggerService: LoggerService,
  ) {}

  async checkDatabaseConnection(): Promise<string> {
    try {
      const isConnected = this.connection.readyState === 1;
      const status = isConnected ? 'DB is Connected' : 'DB is not connected.';
      if (isConnected) {
        this.loggerService.info('Database connection established.');
      } else {
        this.loggerService.warn(
          'Database connection could not be established.',
        );
      }
      return status;
    } catch (error) {
      throw new Error(
        'Error occurred while checking database connection: ' + error,
      );
    }
  }

  getHello(): string {
    try {
      throw '123';
    } catch (error) {
      throw new Error(error);
    }
  }
}
