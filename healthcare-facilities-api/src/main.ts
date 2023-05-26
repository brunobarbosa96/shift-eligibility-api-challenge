import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import 'newrelic';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { SentryInterceptor } from './interceptors/sentry.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();

  // Setup Error logging
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1,
  });

  app.useGlobalInterceptors(new SentryInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Setup Api Docs
  const config = new DocumentBuilder()
    .setTitle('Healthcare Facilities API')
    .setDescription(
      'API responsible to manage all healthcare facilities for the Challenge',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
