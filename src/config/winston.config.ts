import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';

const logDir = 'logs';

export const winstonConfig = WinstonModule.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf((info: any) => {
      return `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}${
        info.stack ? '\n' + String(info.stack) : ''
      }`;
    }),
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: join(logDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: join(logDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
