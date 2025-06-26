import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../services/custom-logger.service';

@Injectable()
export class SessionSecurityMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Skip for non-authenticated requests
    if (!req.session?.user) {
      return next();
    }

    const now = Date.now();

    // Initialize session metadata if not exists
    if (!req.session.metadata) {
      req.session.metadata = {
        createdAt: now,
        lastActivity: now,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      };
    }

    // Check for session hijacking (IP change)
    const currentIp = req.ip || 'unknown';
    if (
      req.session.metadata.ipAddress !== currentIp &&
      process.env.NODE_ENV === 'production'
    ) {
      this.logger.warn(
        `Potential session hijacking detected for user ${req.session.user.id}: IP changed from ${req.session.metadata.ipAddress} to ${currentIp}`,
        'SessionSecurityMiddleware',
      );

      // Destroy session for security
      req.session.destroy((err) => {
        if (err) {
          this.logger.error(
            'Error destroying potentially hijacked session',
            'SessionSecurityMiddleware',
          );
        }
      });

      return res.status(401).json({
        statusCode: 401,
        message: 'Session security violation detected',
        error: 'Unauthorized',
      });
    }

    // Regenerate session ID periodically for security
    const sessionAge = now - req.session.metadata.createdAt;
    const regenerateThreshold = 30 * 60 * 1000; // 30 minutes

    if (sessionAge > regenerateThreshold) {
      const oldSessionId = req.sessionID;
      req.session.regenerate((err) => {
        if (err) {
          this.logger.error(
            `Error regenerating session for user ${req.session?.user?.id}`,
            'SessionSecurityMiddleware',
          );
        } else {
          this.logger.info(
            `Session regenerated for user ${req.session?.user?.id}: ${oldSessionId} -> ${req.sessionID}`,
            'SessionSecurityMiddleware',
          );

          // Update metadata
          if (req.session.metadata) {
            req.session.metadata.createdAt = now;
          }
        }
      });
    }

    // Update last activity
    req.session.metadata.lastActivity = now;

    next();
  }
}

// Extend session data interface
declare module 'express-session' {
  interface SessionData {
    metadata?: {
      createdAt: number;
      lastActivity: number;
      ipAddress: string;
      userAgent: string;
    };
  }
}
