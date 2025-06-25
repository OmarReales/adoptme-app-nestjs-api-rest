import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { create } from 'express-handlebars';
import { AppModule } from './app.module';
import { winstonConfig } from './config/winston.config';
import { CustomLoggerService } from './common/services/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonConfig,
  });

  // Configure express-handlebars view engine
  const hbs = create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '..', 'views', 'layouts'),
    partialsDir: join(__dirname, '..', 'views', 'partials'),
    helpers: {
      // Helper para formatear fechas
      formatDate: (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      },
      // Helper para truncar texto
      truncate: (text: string, length: number) => {
        if (text && text.length > length) {
          return text.substring(0, length) + '...';
        }
        return text;
      },
      // Helper para condicionales
      eq: (a: any, b: any) => a === b,
      // Helper para capitalizar
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

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

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

  // Use the Winston logger that's already configured for the app
  const loggerService = app.get(CustomLoggerService);
  loggerService.info(
    `🚀 Application running on: http://localhost:${port}`,
    'Bootstrap',
  );
  loggerService.info(
    `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}

bootstrap().catch((error) => {
  // Use a basic console.error here since the app may not have started
  console.error('❌ Error starting server:', error);
  process.exit(1);
});
