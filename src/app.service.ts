import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  environment: string;
  database?: {
    status: string;
    message?: string;
  };
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  getHealthStatus(): HealthStatus {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'AdoptMe API',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async getDetailedHealthStatus(): Promise<HealthStatus> {
    const baseHealth = this.getHealthStatus();

    try {
      // Check database connection (1 = connected)
      const dbState = this.mongoConnection.readyState;
      const isConnected = Number(dbState) === 1;
      const dbStatus = {
        status: isConnected ? 'connected' : 'disconnected',
        message: this.getDbStatusMessage(dbState),
      };

      // Test database with a simple ping if connected
      if (isConnected && this.mongoConnection.db) {
        await this.mongoConnection.db.admin().ping();
      }

      return {
        ...baseHealth,
        status: dbStatus.status === 'connected' ? 'healthy' : 'unhealthy',
        database: dbStatus,
      };
    } catch (error) {
      this.logger.error('Health check database error:', error);
      return {
        ...baseHealth,
        status: 'unhealthy',
        database: {
          status: 'error',
          message: 'Database connection check failed',
        },
      };
    }
  }

  private getDbStatusMessage(state: number): string {
    switch (state) {
      case 0:
        return 'Disconnected';
      case 1:
        return 'Connected';
      case 2:
        return 'Connecting';
      case 3:
        return 'Disconnecting';
      default:
        return 'Unknown';
    }
  }
}
