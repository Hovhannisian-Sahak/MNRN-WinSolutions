import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { userTypes } from '../schema/users';
import { ROLES_KEY } from './role.decorators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<userTypes[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return roles.some((role) => user.type?.includes(role));
  }
}
