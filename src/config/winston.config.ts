import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';

const logDir = 'logs';

// Custom log levels with priorities (lower number = higher priority)
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'grey',
  },
};

// Interface for log info object extending winston's TransformableInfo
interface LogInfo extends winston.Logform.TransformableInfo {
  timestamp?: string;
  level: string;
  message: string;
  context?: string;
  requestId?: string;
  userId?: string;
  stack?: string;
}

// Add colors to winston
winston.addColors(customLevels.colors);

// Development format - readable and colorized
const developmentFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const infoObj = info as LogInfo;
    const { timestamp, level, message, context, requestId, userId, stack } =
      infoObj;

    let logMessage = `${timestamp} [${level}]`;

    if (context) logMessage += ` [${context}]`;
    if (requestId) logMessage += ` [ReqID: ${requestId}]`;
    if (userId) logMessage += ` [User: ${userId}]`;

    logMessage += ` ${message}`;

    if (stack) logMessage += `\n${stack}`;

    return logMessage;
  }),
);

// Production format - structured JSON
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const infoObj = info as LogInfo;
    const {
      timestamp,
      level,
      message,
      context,
      requestId,
      userId,
      stack,
      ...rest
    } = infoObj;

    return JSON.stringify({
      timestamp,
      level,
      message,
      context: context ?? null,
      requestId: requestId ?? null,
      userId: userId ?? null,
      stack: stack ?? null,
      ...rest,
    });
  }),
);

// Create transports based on environment
const createTransports = () => {
  const transports: winston.transport[] = [];
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Console transport (always present)
  transports.push(
    new winston.transports.Console({
      level: isDevelopment ? 'debug' : 'info',
      format: isDevelopment ? developmentFormat : productionFormat,
    }),
  );

  // File transports for production
  if (!isDevelopment) {
    // Error logs file
    transports.push(
      new winston.transports.File({
        filename: join(logDir, 'errors.log'),
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        format: productionFormat,
      }),
    );

    // Combined logs file
    transports.push(
      new winston.transports.File({
        filename: join(logDir, 'combined.log'),
        level: 'info',
        maxsize: 20971520, // 20MB
        maxFiles: 5,
        format: productionFormat,
      }),
    );
  }

  return transports;
};

export const winstonConfig = WinstonModule.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: createTransports(),
  exceptionHandlers: [
    new winston.transports.Console({
      format: developmentFormat,
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: join(logDir, 'exceptions.log'),
            format: productionFormat,
          }),
        ]
      : []),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: developmentFormat,
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: join(logDir, 'rejections.log'),
            format: productionFormat,
          }),
        ]
      : []),
  ],
});

// Create a standard winston logger instance
export const winstonLogger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: createTransports(),
  exceptionHandlers: [
    new winston.transports.Console({
      format: developmentFormat,
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: join(logDir, 'exceptions.log'),
            format: productionFormat,
          }),
        ]
      : []),
  ],
  rejectionHandlers: [
    new winston.transports.Console({
      format: developmentFormat,
    }),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: join(logDir, 'rejections.log'),
            format: productionFormat,
          }),
        ]
      : []),
  ],
});

// Export custom levels for use in other parts of the application
export const logLevels = customLevels.levels;

// Custom logger interface
export interface CustomLogger {
  error(message: string, context?: string, meta?: any): void;
  warn(message: string, context?: string, meta?: any): void;
  info(message: string, context?: string, meta?: any): void;
  http(message: string, context?: string, meta?: any): void;
  verbose(message: string, context?: string, meta?: any): void;
  debug(message: string, context?: string, meta?: any): void;
  silly(message: string, context?: string, meta?: any): void;
}
