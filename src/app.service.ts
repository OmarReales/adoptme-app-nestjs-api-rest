import { Injectable } from '@nestjs/common';

interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

@Injectable()
export class AppService {
  getHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AdoptMe API',
    };
  }
}
