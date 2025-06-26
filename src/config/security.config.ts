import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // Rate limiting configuration
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60'), // 60 seconds
    limit: parseInt(process.env.THROTTLE_LIMIT || '100'), // 100 requests per minute
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },

  // Password policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },

  // Session security
  session: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
    regenerateThreshold: parseInt(
      process.env.SESSION_REGENERATE_THRESHOLD || '300000',
    ), // 5 minutes
  },

  // JWT configuration
  jwt: {
    accessTokenExpiration: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Security headers
  headers: {
    hsts: process.env.NODE_ENV === 'production',
    noSniff: true,
    xssProtection: true,
    frameDeny: true,
  },
}));
