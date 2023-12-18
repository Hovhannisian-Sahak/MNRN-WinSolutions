import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.get('port'), () => {
    console.log(`server running on port ${config.get('port')}`);
  });
}
bootstrap();
