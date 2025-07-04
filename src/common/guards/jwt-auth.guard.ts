import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any): any {
    // Throw an exception if the user is not authenticated
    if (err || !user) {
      throw err || new UnauthorizedException('Access token required');
    }
    return user;
  }
}
