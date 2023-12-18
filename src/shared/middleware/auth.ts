import {
  Inject,
  Injectable,
  UnauthorizedException,
  NestMiddleware,
} from '@nestjs/common';
import { UsersRepository } from '../schema/repositories/user.repository';
import { decodeAuthToken } from '../utils/token-generator';
import { NextFunction, Request, Response } from 'express';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(UsersRepository) private readonly userDB: UsersRepository,
  ) {}
  async use(req: Request | any, res: Response, next: NextFunction) {
    try {
      console.log('Request:', req);
      console.log('Response:', res);

      const token = req.cookies.auth_token;
      console.log('Cookies:', req.cookies);
      console.log('Token:', token);

      if (!token) {
        console.log('barev--------------------------');
        throw new UnauthorizedException('Missing auth token');
      }
      const decoded: any = decodeAuthToken(token);
      const user = await this.userDB.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedException('Unauthorized');
      }
      user.password = undefined;
      req.body.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
