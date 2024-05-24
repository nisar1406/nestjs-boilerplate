import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class LoggerService {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            ({ timestamp, level, message }) =>
              `${timestamp} ${level}: ${message}`,
          ),
        ),
      }),
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'combined.log' }),
    ],
  });

  error(message: string, stack) {
    if (stack) {
      const { trace } = stack;
      const stackLines = stack.split('\n');
      const firstStackLine = stackLines[1]; // Skip the first line which contains the error message
      const [, methodName, fileName] =
        /\s+at\s+(\S+)\s+\(([^)]+)\)/.exec(firstStackLine) || [];

      this.logger.error(`Error occurred in file: ${fileName}`);
      this.logger.error(`Error occurred in method: ${methodName}`);
      this.logger.error(message, { trace });
      return;
    }
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
