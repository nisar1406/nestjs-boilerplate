import { Controller, Get, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { AppService } from './app.service';
import { LoggerService } from './services/logger/logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly loggerService: LoggerService, // Inject LoggerService
  ) {}

  @UseGuards(ThrottlerGuard)
  @Get()
  getHello(): string {
    this.loggerService.info('Hello world endpoint called');

    return this.appService.getHello();
  }

  @UseGuards(ThrottlerGuard)
  @Get('/db')
  async getDbConnection(): Promise<string> {
    return await this.appService.checkDatabaseConnection();
  }
}
