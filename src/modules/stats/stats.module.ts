import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { Pet, PetSchema } from '../../schemas/pet.schema';
import { Adoption, AdoptionSchema } from '../../schemas/adoption.schema';
import {
  Notification,
  NotificationSchema,
} from '../../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Pet.name, schema: PetSchema },
      { name: Adoption.name, schema: AdoptionSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
