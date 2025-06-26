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

    // Check if session exists and has valid user data
    if (!request.session?.user) {
      return false;
    }

    const user = request.session.user;

    // Validate required user fields
    if (!user.id || !user.email || !user.role) {
      return false;
    }

    // Additional security: Check if user ID is valid ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(user.id)) {
      return false;
    }

    // Additional security: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return false;
    }

    return true;
  }
}
