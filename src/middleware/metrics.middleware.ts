import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { MetricsService } from '../modules/metrics/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.metricsService.incrementRequestCounter(req.method, req.originalUrl);
    next();
  }
}
