import { Module } from '@nestjs/common';
import { LoggerTestController } from './logger-test.controller';

@Module({
  controllers: [LoggerTestController],
})
export class LoggerTestModule {}
