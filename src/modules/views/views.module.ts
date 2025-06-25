import { Module } from '@nestjs/common';
import { ViewsController } from './views.controller';
import { StatsModule } from '../stats/stats.module';
import { PetsModule } from '../pets/pets.module';
import { AdoptionsModule } from '../adoptions/adoptions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [StatsModule, PetsModule, AdoptionsModule, UsersModule],
  controllers: [ViewsController],
})
export class ViewsModule {}
