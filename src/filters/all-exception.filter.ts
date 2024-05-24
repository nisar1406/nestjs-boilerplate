import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { JoiValidationException } from '../pipes';
import { LoggerService } from '../services/logger/logger.service';
import { MONGO_ERROR_CODES } from '../utils/constants/error-codes';
import { INTERNAL_SERVER_ERROR } from '../utils/constants/messages';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly loggerService: LoggerService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const statusCode = this.getHttpStatus(exception);
    const message = this.getMessage(exception);
    const timestamp = new Date().toISOString();
    const path = httpAdapter.getRequestUrl(ctx.getRequest());
    const errors = [];
    const responseBody = {
      statusCode,
      message,
      timestamp,
      path,
      errors,
    };

    if (exception instanceof JoiValidationException) {
      // Handle JoiValidationException
      // responseBody.message = 'Validation error';
      responseBody.errors = exception.details.map((detail) => ({
        message: detail.message,
        path: detail.path.join('.'),
      }));
    }

    this.loggerService.error(message, exception.stack);
    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }

  private getHttpStatus(exception: any): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    } else if (exception instanceof JoiValidationException) {
      return HttpStatus.BAD_REQUEST;
    } else {
      return (
        this.getMongoErrorCode(exception.code) ||
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private getMessage(exception: any): string {
    if (exception instanceof JoiValidationException) {
      return 'Validation error';
    }
    return exception.message || INTERNAL_SERVER_ERROR;
  }

  private getMongoErrorCode(code: number): number | undefined {
    return MONGO_ERROR_CODES[code];
  }
}
