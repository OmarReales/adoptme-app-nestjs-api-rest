import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// Configurations
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PetsModule } from './modules/pets/pets.module';
import { AdoptionsModule } from './modules/adoptions/adoptions.module';
import { MockingModule } from './modules/mocking/mocking.module';
import { LoggerTestModule } from './modules/logger-test/logger-test.module';

// Global filters and guards
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, emailConfig],
    }),

    // Database
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/adoptme-db',
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      },
    ]),

    // Feature modules
    CommonModule,
    AuthModule,
    UsersModule,
    PetsModule,
    AdoptionsModule,
    MockingModule,
    LoggerTestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .exclude(
        // Exclude health check and static endpoints from logging
        { path: 'health', method: RequestMethod.GET },
        { path: 'favicon.ico', method: RequestMethod.GET },
      )
      .forRoutes('*'); // Apply to all routes
  }
}
