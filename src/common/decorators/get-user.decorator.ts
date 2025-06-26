import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // Return user from JWT authentication (set by HybridAuthGuard or JwtAuthGuard)
    if (request.user) {
      return request.user;
    }

    // Return user from session authentication
    if (request.session?.user) {
      return {
        userId: request.session.user.id,
        username: request.session.user.username,
        role: request.session.user.role,
        email: request.session.user.email,
        firstName: request.session.user.firstName,
        lastName: request.session.user.lastName,
      };
    }

    return null;
  },
);
