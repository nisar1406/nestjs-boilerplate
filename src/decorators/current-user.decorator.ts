import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: any = ctx.switchToHttp().getRequest<Request>();
    console.log('Extracting user in @CurrentUser decorator:', request.user); // Debug log
    return request.user;
  },
);
