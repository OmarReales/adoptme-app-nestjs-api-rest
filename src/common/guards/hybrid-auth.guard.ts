import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../modules/auth/auth.service';
import { JwtPayload, AuthenticatedUser } from '../interfaces/auth.interfaces';
import { UserRole } from '../../schemas/user.schema';

@Injectable()
export class HybridAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Try JWT Authentication first (higher priority for hybrid scenarios)
    if (await this.validateJwt(request)) {
      return true;
    }

    // 2. Try Session Authentication (for web app)
    if (this.validateSession(request)) {
      return true;
    }

    // Throw unauthorized exception instead of returning false
    throw new UnauthorizedException('Authentication required');
  }

  private validateSession(request: Request): boolean {
    if (!request.session?.user) {
      return false;
    }

    const user = request.session.user;

    // Validate required user fields
    if (!user.id || !user.email || !user.role) {
      return false;
    }

    // Validate ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(user.id)) {
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return false;
    }

    // Set user in request for consistency
    (request as Request & { user: AuthenticatedUser }).user = {
      userId: user.id,
      username: user.username,
      role: user.role as UserRole, // Convert string to enum
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
    };

    return true;
  }

  private async validateJwt(request: Request): Promise<boolean> {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    try {
      const token = authHeader.substring(7);
      const payload = this.jwtService.verify<JwtPayload>(token);

      // Validate payload structure
      if (!payload.sub || !payload.username || !payload.role) {
        return false;
      }

      // Validate ObjectId format
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(payload.sub)) {
        return false;
      }

      // Validate user still exists in database
      const user = await this.authService.validateUser(payload.sub);
      if (!user) {
        return false;
      }

      // Set user in request
      (request as Request & { user: AuthenticatedUser }).user = {
        userId: payload.sub,
        username: payload.username,
        role: payload.role,
      };

      return true;
    } catch {
      return false;
    }
  }
}
