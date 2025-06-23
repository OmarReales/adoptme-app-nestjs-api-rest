import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLoggerService } from '../services/custom-logger.service';

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(CustomLoggerService) private readonly logger: CustomLoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : typeof message === 'object' &&
              message !== null &&
              'message' in message
            ? (message as { message: string }).message
            : 'Internal server error',
    };

    // Log with appropriate level based on status code
    const logLevel = status >= 500 ? 'error' : 'warning';
    const errorString =
      exception instanceof Error ? exception.stack : String(exception);

    this.logger.logWithRequest(
      logLevel,
      `${request.method} ${request.url} - ${status}`,
      (request.headers['x-request-id'] as string) || 'unknown',
      'AllExceptionsFilter',
      {
        statusCode: status,
        errorDetails: errorResponse,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
      },
    );

    if (logLevel === 'error') {
      this.logger.error(
        `Unhandled exception: ${errorResponse.message}`,
        'AllExceptionsFilter',
        errorString,
      );
    }

    response.status(status).json(errorResponse);
  }
}
