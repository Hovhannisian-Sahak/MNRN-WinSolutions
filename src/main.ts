import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { raw } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  app.use('/api/v1/orders/webhook', raw({ type: '*/*' }));
  app.setGlobalPrefix(config.get('appPrefix'));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.get('port'), () => {
    console.log(`server running on port ${config.get('port')}`);
  });
}
bootstrap();
