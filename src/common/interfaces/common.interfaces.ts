import { UserRole } from '../../schemas/user.schema';

/**
 * Interface for JWT payload
 */
export interface JwtPayload {
  sub: string; // user ID
  userName: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Interface for user from JWT token in request
 */
export interface RequestUser {
  userId: string;
  userName: string;
  role: UserRole;
}

/**
 * Interface for pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Interface for filter options
 */
export interface FilterOptions extends PaginationOptions {
  status?: string;
  role?: string;
  breed?: string;
}

/**
 * Interface for query filters
 */
export interface QueryFilter {
  [key: string]: any;
}

/**
 * Interface for API response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Interface for error response
 */
export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Interface for business event logging
 */
export interface BusinessEvent {
  eventType: string;
  data: Record<string, any>;
  context: string;
  userId?: string;
  timestamp: Date;
}

/**
 * Interface for database operation logging
 */
export interface DatabaseOperation {
  operation: 'create' | 'update' | 'delete' | 'read';
  model: string;
  description: string;
  context: string;
  timestamp: Date;
}
