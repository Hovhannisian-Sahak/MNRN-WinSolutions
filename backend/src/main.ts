import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from 'config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction, raw } from 'express';
import csurf from 'csurf';
import cors from 'cors';
const ROOT_IGNORED_PATHS = ['/api/v1/orders/webhook'];
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.use(cookieParser());
  app.use('/api/v1/orders/webhook', raw({ type: '*/*' }));
  const csrfMiddleware = csurf({
    cookie: true,
  });
  app.use(
    cors({
      origin: 'http://localhost:3000', // Replace with your frontend's local development server URL
      credentials: true,
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (ROOT_IGNORED_PATHS.includes(req.path)) {
      return next();
    }
    return csrfMiddleware(req, res, next);
  });
  app.setGlobalPrefix(config.get('appPrefix'));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.get('port'), () => {
    console.log(`server running on port ${config.get('port')}`);
  });
}
bootstrap();
