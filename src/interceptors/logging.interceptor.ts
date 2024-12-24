import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AllConfigType } from '../configs';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    return next.handle().pipe(
      tap((data) => {
        const nodeEnv = this.configService.getOrThrow('app.nodeEnv', {
          infer: true,
        });
        const responseTime = Date.now() - now;
        const payload = JSON.stringify(request.body);

        const logMessage = `
          URL: ${url}
          Method: ${method}
          Time: ${responseTime}ms
          Payload: ${payload}
          Response: ${JSON.stringify(data)}
        `;

        if (nodeEnv === 'development') {
          this.logger.info(logMessage);
        }
      }),
    );
  }
}
