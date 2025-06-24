import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CustomLoggerService } from '../services/custom-logger.service';
import { RequestUser } from '../interfaces/common.interfaces';

interface ExtendedRequest extends Request {
  requestId?: string;
  startTime?: number;
  user?: RequestUser;
}

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: ExtendedRequest, res: Response, next: NextFunction): void {
    // Generate unique request ID if not present
    const requestId = String(req.headers['x-request-id'] || uuidv4());
    req.requestId = requestId;
    req.startTime = Date.now();

    // Add request ID to response headers for tracing
    res.setHeader('X-Request-ID', requestId);

    // Extract user information if available
    const userId = this.extractUserId(req);
    const userAgent = String(req.headers['user-agent'] || 'Unknown');
    const clientIp = req.ip || req.connection.remoteAddress || 'Unknown';

    // Log incoming request
    this.logger.logWithRequest(
      'http',
      `${req.method} ${req.originalUrl || req.url} - START`,
      requestId,
      'HttpLoggerMiddleware',
      {
        method: req.method,
        url: req.originalUrl || req.url,
        userAgent,
        clientIp,
        userId,
        headers: this.sanitizeHeaders(req.headers as Record<string, unknown>),
        query: req.query,
        body: this.sanitizeBody(req.body as Record<string, unknown>),
      },
    );

    // Capture response completion
    const originalSend = res.send;
    const logger = this.logger;

    res.send = function (body?: unknown): Response {
      const responseTime = Date.now() - (req.startTime || Date.now());
      const statusCode = res.statusCode;

      // Log response completion
      logger.logWithRequest(
        statusCode >= 400 ? 'warning' : 'http',
        `${req.method} ${req.originalUrl || req.url} - ${statusCode}`,
        requestId,
        'HttpLoggerMiddleware',
        {
          method: req.method,
          url: req.originalUrl || req.url,
          statusCode,
          responseTime: `${responseTime}ms`,
          userAgent,
          clientIp,
          userId,
          responseSize: body ? Buffer.byteLength(JSON.stringify(body)) : 0,
        },
      );

      return originalSend.call(this, body) as Response;
    };

    next();
  }

  private extractUserId(req: ExtendedRequest): string | null {
    try {
      return req.user?.userId || null;
    } catch {
      return null;
    }
  }

  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const sanitized = { ...headers };
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body || typeof body !== 'object') return {};

    const sanitized = { ...body };
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.confirmPassword;
    delete sanitized.token;
    delete sanitized.secret;
    return sanitized;
  }
}
