import {
  Inject,
  Injectable,
  UnauthorizedException,
  NestMiddleware,
} from '@nestjs/common';
import { UsersRepository } from '../repositories/user.repository';
import { decodeAuthToken } from '../utils/token-generator';

import { NextFunction, Request, Response } from 'express';
import config from 'config';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(UsersRepository) private readonly userDB: UsersRepository,
  ) {}
  async use(req: Request | any, res: Response, next: NextFunction) {
    console.log('AuthMiddleware: Start');
    try {
      const token = req.cookies.auth_token;
      console.log(token);
      if (!token) {
        throw new UnauthorizedException('Missing Auth token');
      }
      const decoded: any = decodeAuthToken(token);
      const decodedString = JSON.stringify(decoded, null, 2);

      console.log('decodedString--------------', decodedString);
      console.log('decoded.id--------------', decoded._id);
      const user = await this.userDB.findById(decoded._id);
      console.log('user--------------', user);
      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }
      user.password = undefined;
      req.user = user;
      next();
    } catch (error) {
      console.error('AuthMiddleware Error:', error.message);
      throw new UnauthorizedException(error.message);
    }
    console.log('AuthMiddleware: End');
  }
}
