import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { AllConfigType } from './configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJs Boilerplate')
    .setDescription('')
    .setVersion('1.0')
    .addTag('nestjs boilerplate')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = configService.getOrThrow('app.port', { infer: true }) || 3000;
  await app.listen(port);
}
bootstrap();
