import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { Role } from '../utils/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // No roles required, allow access
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming user information is stored in the request object
    return this.matchRoles(requiredRoles, user.roles);
  }

  private matchRoles(requiredRoles: Role[], userRoles: Role[]): boolean {
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
