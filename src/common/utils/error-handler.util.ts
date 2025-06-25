import { CustomLoggerService } from '../services/custom-logger.service';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Utility class for consistent error handling across services
 */
export class ErrorHandlerUtil {
  /**
   * Validate MongoDB ObjectId format
   * @param id The ID to validate
   * @param fieldName The name of the field for error messages
   */
  static validateObjectId(id: string, fieldName = 'ID'): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ${fieldName}`);
    }
  }
  /**
   * Handle service errors with consistent logging and re-throwing
   * @param error The error to handle
   * @param context The context/service name where the error occurred
   * @param logger The logger service instance
   * @param operation Optional operation description
   */
  static handleServiceError(
    error: unknown,
    context: string,
    logger: CustomLoggerService,
    operation?: string,
  ): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    const fullMessage = operation
      ? `${operation}: ${errorMessage}`
      : errorMessage;

    logger.error(fullMessage, context, errorStack);
    throw error;
  }

  /**
   * Handle database operation errors specifically
   * @param error The error to handle
   * @param operation The database operation (create, update, delete, etc.)
   * @param model The model/collection name
   * @param context The service context
   * @param logger The logger service instance
   */
  static handleDatabaseError(
    error: unknown,
    operation: string,
    model: string,
    context: string,
    logger: CustomLoggerService,
  ): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    const fullMessage = `Failed to ${operation} ${model}: ${errorMessage}`;

    logger.error(fullMessage, context, errorStack);
    throw error;
  }

  /**
   * Create a standardized error response
   * @param message Error message
   * @param statusCode HTTP status code
   * @param error Optional error code
   */
  static createErrorResponse(
    message: string,
    statusCode: number,
    error?: string,
  ) {
    return {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(error && { error }),
    };
  }
}
