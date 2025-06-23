import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { winstonConfig } from './config/winston.config';
import { CustomLoggerService } from './common/services/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });

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
