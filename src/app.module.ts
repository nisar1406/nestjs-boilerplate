import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appConfig, authConfig, databaseConfig, fileConfig } from './configs';
import { DatabaseModule } from './database/database.module';
import { AllExceptionsFilter } from './filters';
import { AuthGuard } from './guards';
import { LoggingInterceptor } from './interceptors';
import { CorsMiddleware, MetricsMiddleware } from './middleware';
import { AuthModule, TokenModule, UsersModule } from './modules';
import { FileModule } from './modules/file/file.module';
import { MetricsController } from './modules/metrics/metrics.controller';
import { MetricsService } from './modules/metrics/metrics.service';
import { LoggerService } from './services';
import { BackupModule } from './services/backup/backup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, fileConfig], // Load your auth configuration
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    BackupModule,
    DatabaseModule,
    TokenModule,
    UsersModule,
    FileModule,
  ],
  controllers: [AppController, MetricsController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    LoggerService,
    MetricsService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
    consumer
      .apply(MetricsMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
