import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Extend Express Request interface to include session
declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
  }
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    return !!request.session?.user;
  }
}
