import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { create } from 'express-handlebars';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { winstonLogger } from './config/winston.config';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });

  // Configure express-handlebars view engine
  const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '..', 'views', 'layouts'),
    partialsDir: join(__dirname, '..', 'views', 'partials'),
    helpers: {
      // Date formatting helper
      formatDate: (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      },
      // Text truncation helper
      truncate: (text: string, length: number) => {
        if (text && text.length > length) {
          return text.substring(0, length) + '...';
        }
        return text;
      },
      // Conditional helpers
      eq: (a: any, b: any) => a === b,
      gt: (a: any, b: any) => a > b,
      lt: (a: any, b: any) => a < b,
      gte: (a: any, b: any) => a >= b,
      lte: (a: any, b: any) => a <= b,
      // Math operation helpers
      add: (a: number, b: number) => a + b,
      subtract: (a: number, b: number) => a - b,
      multiply: (a: number, b: number) => a * b,
      // Range generation helper
      range: (start: number, end: number) => {
        const result: number[] = [];
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
        return result;
      },
      // Text capitalization helper
      capitalize: (text: string) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
      },
    },
  });

  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');
  app.set('views', join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Configure cookie parser
  app.use(cookieParser());

  // Configure express session with enhanced security
  app.use(
    session({
      secret:
        process.env.SESSION_SECRET ||
        'adoptme-super-secret-key-change-in-production-min-32-chars',
      resave: false,
      saveUninitialized: false,
      name: process.env.SESSION_NAME || 'adoptme.session',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      },
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global prefix for API routes, excluding views and health check
  app.setGlobalPrefix('api', {
    exclude: [
      '/',
      '/login',
      '/register',
      '/profile',
      '/view-pets',
      '/view-adoptions',
      '/view-pets/*',
      '/view-adoptions/*',
      '/health', // Health check should be at root level
    ],
  });

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AdoptMe API')
    .setDescription('Pet adoption platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Use Winston logger directly
  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});
