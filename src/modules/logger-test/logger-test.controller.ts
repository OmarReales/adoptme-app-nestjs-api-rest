import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CustomLoggerService } from '../../common/services/custom-logger.service';

@ApiTags('Logger Testing')
@Controller('loggertest')
export class LoggerTestController {
  constructor(private readonly logger: CustomLoggerService) {}

  @Get()
  @ApiOperation({
    summary: 'Test all logging levels',
    description:
      'Triggers logs at all levels (debug, http, info, warning, error, fatal) for testing purposes',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Optional user ID to include in logs',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'requestId',
    required: false,
    description: 'Optional request ID to include in logs',
    example: 'req-123-456-789',
  })
  @ApiResponse({
    status: 200,
    description: 'All log levels have been triggered successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        logLevels: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  testAllLogLevels(
    @Query('userId') userId?: string,
    @Query('requestId') requestId?: string,
  ) {
    const timestamp = new Date().toISOString();
    const context = 'LoggerTestController';

    this.logger.info('🧪 Starting logger test sequence', context, {
      userId,
      requestId,
    });

    // Test DEBUG level
    this.logger.debug(
      '🔍 DEBUG: This is a debug message for development',
      context,
      {
        testType: 'debug',
        userId,
        requestId,
        details: 'Debug logs help developers trace application flow',
      },
    );

    // Test HTTP level
    this.logger.http('🌐 HTTP: Simulated HTTP request log', context, {
      testType: 'http',
      method: 'GET',
      url: '/loggertest',
      statusCode: 200,
      responseTime: 42,
      userAgent: 'Logger-Test-Client/1.0',
      userId,
      requestId,
    });

    // Test INFO level
    this.logger.info('ℹ️ INFO: Application information message', context, {
      testType: 'info',
      userId,
      requestId,
      event: 'logger_test_executed',
      metadata: {
        feature: 'logging_system',
        version: '1.0.0',
      },
    });

    // Test WARNING level
    this.logger.warning('⚠️ WARNING: This is a warning message', context, {
      testType: 'warning',
      userId,
      requestId,
      reason: 'Simulated warning for testing purposes',
      recommendation: 'This is just a test, no action needed',
    });

    // Test ERROR level
    this.logger.error(
      '❌ ERROR: Simulated error for testing',
      'Error: Test error stack trace\n    at LoggerTestController.testAllLogLevels\n    at TestModule.execute',
      context,
      {
        testType: 'error',
        userId,
        requestId,
        errorCode: 'TEST_ERROR_001',
        severity: 'medium',
        recoverable: true,
      },
    );

    // Test FATAL level
    this.logger.fatal('💀 FATAL: Simulated fatal error for testing', context, {
      testType: 'fatal',
      userId,
      requestId,
      systemState: 'degraded',
      impact: 'high',
      urgency: 'immediate',
    });

    // Test structured logging methods
    this.logger.logAuthentication(
      'login',
      userId,
      'test@example.com',
      '127.0.0.1',
      'Logger-Test-Client/1.0',
    );

    this.logger.logDatabaseOperation(
      'read',
      'LogTest',
      'Database operation test completed successfully',
      context,
      'test-123',
      userId,
      15,
    );

    this.logger.logBusinessEvent(
      'logger_test_completed',
      {
        levels_tested: ['debug', 'http', 'info', 'warning', 'error', 'fatal'],
        test_duration: '~1s',
        success: true,
      },
      context,
      userId,
    );

    this.logger.info(
      '✅ Logger test sequence completed successfully',
      context,
      {
        userId,
        requestId,
        completedAt: timestamp,
      },
    );

    return {
      message: 'All log levels have been triggered successfully',
      timestamp,
      logLevels: ['debug', 'http', 'info', 'warning', 'error', 'fatal'],
      structuredMethods: ['authentication', 'database', 'business_event'],
      testParameters: {
        userId: userId || null,
        requestId: requestId || null,
      },
      note: 'Check your console output and log files (in production) to see the different log formats and levels',
    };
  }

  @Get('levels')
  @ApiOperation({
    summary: 'Get available log levels',
    description:
      'Returns information about all available logging levels and their priorities',
  })
  @ApiResponse({
    status: 200,
    description: 'Log levels information retrieved successfully',
  })
  getLogLevels() {
    return {
      levels: {
        fatal: {
          priority: 0,
          description: 'System is unusable',
          color: 'bold red',
        },
        error: { priority: 1, description: 'Error conditions', color: 'red' },
        warning: {
          priority: 2,
          description: 'Warning conditions',
          color: 'yellow',
        },
        info: {
          priority: 3,
          description: 'Informational messages',
          color: 'green',
        },
        http: {
          priority: 4,
          description: 'HTTP request logs',
          color: 'magenta',
        },
        debug: { priority: 5, description: 'Debug messages', color: 'blue' },
      },
      currentLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      environment: process.env.NODE_ENV || 'development',
      note: 'Lower priority numbers have higher importance. Logs are filtered by the current level.',
    };
  }
}
