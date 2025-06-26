import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  secret:
    process.env.SESSION_SECRET ||
    'adoptme-super-secret-key-change-in-production-min-32-chars',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours in ms
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  name: process.env.SESSION_NAME || 'adoptme.session',
}));
