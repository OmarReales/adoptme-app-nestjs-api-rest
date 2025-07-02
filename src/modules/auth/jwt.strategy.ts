import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  userName: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ValidatedUser {
  userId: string;
  userName: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>('jwt.secret') ||
        configService.get<string>('JWT_SECRET') ||
        'fallback-secret-change-in-production',
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): ValidatedUser {
    // Validate payload structure
    if (!payload.sub || !payload.userName || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Validate user ID format (ObjectId)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(payload.sub)) {
      throw new UnauthorizedException('Invalid user ID format');
    }

    // Validate role
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(payload.role)) {
      throw new UnauthorizedException('Invalid user role');
    }

    return {
      userId: payload.sub,
      userName: payload.userName,
      role: payload.role,
    };
  }
}
