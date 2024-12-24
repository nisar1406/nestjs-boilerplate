import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as JWT from 'jsonwebtoken';
import { Observable } from 'rxjs';

import { AllConfigType } from '../configs';
import { IS_PUBLIC_KEY } from '../decorators/common.decorators';
import { TokenService } from '../modules/token/token.service';
import { UsersService } from '../modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private async validateRequest(request: any): Promise<boolean> {
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      return false;
    }

    const secret = this.configService.getOrThrow('auth.secret', {
      infer: true,
    });

    try {
      const decodedToken: any = await JWT.verify(token, secret);

      const user = await this.userService.findOne(decodedToken.id);
      request.user = user; // Attach user object to request
      return true;
    } catch (error) {
      throw error;
    }
  }

  private extractTokenFromRequest(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove "Bearer " from the token string
  }
}
