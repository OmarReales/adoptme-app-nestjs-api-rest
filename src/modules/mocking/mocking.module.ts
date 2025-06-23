import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MockingController } from './mocking.controller';
import { MockingService } from './mocking.service';
import { Pet, PetSchema } from '../../schemas/pet.schema';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pet.name, schema: PetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [MockingController],
  providers: [MockingService],
  exports: [MockingService],
})
export class MockingModule {}
