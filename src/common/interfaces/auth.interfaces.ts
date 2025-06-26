import { UserRole } from '../../schemas/user.schema';

/**
 * User data from session authentication
 */
export interface SessionUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

/**
 * User data from JWT authentication
 */
export interface JwtUser {
  userId: string;
  username: string;
  role: UserRole;
}

/**
 * Unified user interface for HybridAuthGuard
 * Contains user data that's available regardless of authentication method
 */
export interface AuthenticatedUser {
  userId: string;
  username: string;
  role: UserRole;
  // Optional fields that may not be available from JWT
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  user: SessionUser;
  access_token: string;
  message: string;
}

/**
 * Registration response interface
 */
export interface RegistrationResponse {
  user: SessionUser;
  message: string;
}

/**
 * JWT payload interface
 */
export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Authentication result from AuthService
 */
export interface AuthResult {
  user: {
    _id: string;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    role: UserRole;
  };
  access_token: string;
}
