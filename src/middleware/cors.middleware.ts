import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cors from 'cors';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // You can customize CORS options as needed
    cors()(req, res, next);
  }
}
