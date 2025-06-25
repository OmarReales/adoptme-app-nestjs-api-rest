import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/health') // Cambiar a una ruta específica para health check
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
