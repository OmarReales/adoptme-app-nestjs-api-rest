import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { logLevels } from '../../config/winston.config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Create a simplified logger instance with our custom levels
    this.logger = winston.createLogger({
      levels: logLevels,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.simple(),
          ),
        }),
      ],
    });
  }

  debug(message: string, context?: string, meta?: any): void {
    this.logger.debug(message, { context, ...meta });
  }

  http(message: string, context?: string, meta?: any): void {
    this.logger.log('http', message, { context, ...meta });
  }

  log(message: string, context?: string, meta?: any): void {
    this.logger.info(message, { context, ...meta });
  }

  info(message: string, context?: string, meta?: any): void {
    this.logger.info(message, { context, ...meta });
  }

  warning(message: string, context?: string, meta?: any): void {
    this.logger.log('warning', message, { context, ...meta });
  }

  warn(message: string, context?: string, meta?: any): void {
    this.logger.log('warning', message, { context, ...meta });
  }

  error(message: string, stack?: string, context?: string, meta?: any): void {
    this.logger.error(message, { context, stack, ...meta });
  }

  fatal(message: string, context?: string, meta?: any): void {
    this.logger.log('fatal', message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any): void {
    this.logger.debug(message, { context, ...meta });
  }

  // Helper methods for structured logging
  logWithUser(
    level: string,
    message: string,
    userId: string,
    context?: string,
    meta?: any,
  ): void {
    this.logger.log(level, message, { context, userId, ...meta });
  }

  logWithRequest(
    level: string,
    message: string,
    requestId: string,
    context?: string,
    meta?: any,
  ): void {
    this.logger.log(level, message, { context, requestId, ...meta });
  }

  logHttpRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userAgent?: string,
    userId?: string,
    requestId?: string,
  ): void {
    this.logger.log(
      'http',
      `${method} ${url} ${statusCode} - ${responseTime}ms`,
      {
        context: 'HTTP',
        method,
        url,
        statusCode,
        responseTime,
        userAgent,
        userId,
        requestId,
      },
    );
  }

  logAuthentication(
    action: 'login' | 'logout' | 'register' | 'failed_login',
    userId?: string,
    email?: string,
    ip?: string,
    userAgent?: string,
  ): void {
    const level = action === 'failed_login' ? 'warning' : 'info';
    this.logger.log(level, `Authentication: ${action}`, {
      context: 'Authentication',
      userId,
      email,
      ip,
      userAgent,
      action,
    });
  }

  logDatabaseOperation(
    operation: 'create' | 'read' | 'update' | 'delete',
    entity: string,
    entityId?: string,
    userId?: string,
    duration?: number,
  ): void {
    this.logger.info(`Database ${operation}: ${entity}`, {
      context: 'Database',
      operation,
      entity,
      entityId,
      userId,
      duration,
    });
  }

  logBusinessEvent(
    event: string,
    details: any,
    context?: string,
    userId?: string,
  ): void {
    this.logger.info(`Business Event: ${event}`, {
      context: context || 'Business',
      event,
      details,
      userId,
    });
  }
}
