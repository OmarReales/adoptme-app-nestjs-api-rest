import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../interfaces/auth.interfaces';
import { UserRole } from '../../schemas/user.schema';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser | null => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();

    // Return user from JWT authentication (set by HybridAuthGuard or JwtAuthGuard)
    if (request.user) {
      return request.user;
    }

    // Return user from session authentication
    if (request.session?.user) {
      return {
        userId: request.session.user.id,
        username: request.session.user.username,
        role: request.session.user.role as UserRole, // Convert string to enum
        email: request.session.user.email,
        firstName: request.session.user.firstName,
        lastName: request.session.user.lastName,
      };
    }

    return null;
  },
);
