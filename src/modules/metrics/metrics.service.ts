// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, register } from 'prom-client';

interface RequestMetric {
  method: string;
  route: string;
  timestamp: Date;
}

@Injectable()
export class MetricsService {
  private requestCounter: Counter<string>;
  private requestMetrics: RequestMetric[] = [];

  constructor() {
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route'],
    });

    register.registerMetric(this.requestCounter);
  }

  incrementRequestCounter(method: string, route: string) {
    this.requestCounter.labels(method, route).inc();
    this.requestMetrics.push({ method, route, timestamp: new Date() });
  }

  async getMetrics() {
    return register.metrics();
  }

  getRequestMetrics(): RequestMetric[] {
    return this.requestMetrics;
  }
}
