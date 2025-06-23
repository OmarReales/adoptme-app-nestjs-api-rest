import { Module, Global } from '@nestjs/common';
import { CustomLoggerService } from './services/custom-logger.service';

@Global()
@Module({
  providers: [CustomLoggerService],
  exports: [CustomLoggerService],
})
export class CommonModule {}
