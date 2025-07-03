import { Module } from '@nestjs/common';
import { ViewsController } from './views.controller';
import { ViewsService } from './views.service';
import { StatsModule } from '../stats/stats.module';
import { PetsModule } from '../pets/pets.module';
import { AdoptionsModule } from '../adoptions/adoptions.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StatsModule, PetsModule, AdoptionsModule, UsersModule, AuthModule],
  controllers: [ViewsController],
  providers: [ViewsService],
})
export class ViewsModule {}
