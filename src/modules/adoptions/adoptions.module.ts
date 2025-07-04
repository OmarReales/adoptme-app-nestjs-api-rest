import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdoptionsService } from './adoptions.service';
import { AdoptionsController } from './adoptions.controller';
import { Adoption, AdoptionSchema } from '../../schemas/adoption.schema';
import { Pet, PetSchema } from '../../schemas/pet.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { PetsModule } from '../pets/pets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Adoption.name, schema: AdoptionSchema },
      { name: Pet.name, schema: PetSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PetsModule,
    NotificationsModule,
    AuthModule,
  ],
  controllers: [AdoptionsController],
  providers: [AdoptionsService],
  exports: [AdoptionsService],
})
export class AdoptionsModule {}
