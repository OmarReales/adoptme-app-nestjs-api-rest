import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService, HealthStatus } from './app.service';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Basic health check endpoint',
    description: 'Returns basic health status of the AdoptMe API service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2025-07-02T10:30:00.000Z' },
        service: { type: 'string', example: 'AdoptMe API' },
        version: { type: 'string', example: '1.0.0' },
        uptime: { type: 'number', example: 3600 },
        environment: { type: 'string', example: 'production' },
      },
    },
  })
  getHealth(): HealthStatus {
    return this.appService.getHealthStatus();
  }

  @Get('detailed')
  @ApiOperation({
    summary: 'Detailed health check endpoint',
    description:
      'Returns detailed health status including database connectivity',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2025-07-02T10:30:00.000Z' },
        service: { type: 'string', example: 'AdoptMe API' },
        version: { type: 'string', example: '1.0.0' },
        uptime: { type: 'number', example: 3600 },
        environment: { type: 'string', example: 'production' },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            message: { type: 'string', example: 'Connected' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
  })
  async getDetailedHealth(): Promise<HealthStatus> {
    return this.appService.getDetailedHealthStatus();
  }
}
