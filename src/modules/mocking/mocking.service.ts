import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { Pet, PetStatus } from '../../schemas/pet.schema';
import { User, UserRole } from '../../schemas/user.schema';

@Injectable()
export class MockingService {
  private readonly logger = new Logger(MockingService.name);

  constructor(
    @InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async generateMockPets(count: number = 100): Promise<any[]> {
    this.logger.log(`Starting generation of ${count} mock pets`);

    try {
      const mockPets: any[] = [];

      // Define pet types with their common breeds
      const petTypes = [
        {
          type: 'dog',
          breeds: [
            'Labrador Retriever',
            'Golden Retriever',
            'German Shepherd',
            'Bulldog',
            'Poodle',
            'Beagle',
            'Rottweiler',
            'Yorkshire Terrier',
            'Dachshund',
            'Siberian Husky',
            'Border Collie',
            'Chihuahua',
            'Boxer',
            'Shih Tzu',
            'Boston Terrier',
            'Cocker Spaniel',
            'Pomeranian',
            'Australian Shepherd',
          ],
        },
        {
          type: 'cat',
          breeds: [
            'Persian',
            'Maine Coon',
            'British Shorthair',
            'Ragdoll',
            'Bengal',
            'Siamese',
            'Abyssinian',
            'Russian Blue',
            'Scottish Fold',
            'Sphynx',
            'Norwegian Forest Cat',
            'Birman',
            'Oriental Shorthair',
            'Devon Rex',
          ],
        },
      ];

      for (let i = 0; i < count; i++) {
        // Randomly choose pet type (70% dogs, 30% cats)
        const petType = faker.datatype.boolean(0.7) ? petTypes[0] : petTypes[1];

        // Generate realistic pet data
        const name = faker.person.firstName();
        const breed = faker.helpers.arrayElement(petType.breeds);
        const age = faker.number.int({ min: 1, max: 15 });

        // Generate description based on personality traits
        const personalities = [
          'friendly and playful',
          'calm and gentle',
          'energetic and loves to play fetch',
          'independent but affectionate',
          'loyal and protective',
          'curious and loves exploring',
          'well-behaved and easy to train',
          'loves outdoor activities and long walks',
          'perfect lap companion, very affectionate',
          'great with children and other pets',
          'intelligent and quick to learn',
          'gentle giant with a big heart',
        ];

        const description = `${name} is a ${personalities[faker.number.int({ min: 0, max: personalities.length - 1 })]} ${petType.type}. ${faker.lorem.sentence()}`;

        mockPets.push({
          name,
          breed,
          age,
          owner: null,
          status: PetStatus.AVAILABLE,
          description,
          image: faker.image.urlLoremFlickr({
            category: petType.type,
            width: 400,
            height: 300,
          }),
          likedBy: [],
        });
      }

      // Insert all pets in batch
      const createdPets = await this.petModel.insertMany(mockPets);

      this.logger.log(`Successfully created ${createdPets.length} mock pets`);
      return createdPets;
    } catch (error: any) {
      this.logger.error(
        `Failed to generate mock pets: ${error?.message || 'Unknown error'}`,
        error?.stack,
      );
      throw error;
    }
  }

  async clearAllPets(): Promise<void> {
    try {
      const result = await this.petModel.deleteMany({});
      this.logger.log(`Cleared ${result.deletedCount} pets from database`);
    } catch (error: any) {
      this.logger.error(
        `Failed to clear pets: ${error?.message || 'Unknown error'}`,
        error?.stack,
      );
      throw error;
    }
  }

  async generateMockUsers(count: number = 50): Promise<any[]> {
    this.logger.log(`Starting generation of ${count} mock users`);

    try {
      const mockUsers: any[] = [];
      const hashedPassword = await bcrypt.hash('password123', 12);

      for (let i = 0; i < count; i++) {
        // Generate realistic user data with Faker
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        // Create username with some variation to avoid conflicts
        const baseUsername = faker.internet.userName();
        const username = `${baseUsername}${faker.number.int({ min: 1, max: 999 })}`;

        // Generate email with different providers
        const emailProviders = [
          'gmail.com',
          'yahoo.com',
          'outlook.com',
          'hotmail.com',
        ];
        const provider = faker.helpers.arrayElement(emailProviders);
        const email = `${username.toLowerCase()}@${provider}`;

        // Age between 18 and 80
        const age = faker.number.int({ min: 18, max: 80 });

        // 10% chance of being admin
        const role = faker.datatype.boolean(0.1)
          ? UserRole.ADMIN
          : UserRole.USER;

        // 80% chance of verified email
        const isEmailVerified = faker.datatype.boolean(0.8);

        mockUsers.push({
          username,
          firstname: firstName,
          lastname: lastName,
          email,
          password: hashedPassword,
          age,
          role,
          isEmailVerified,
          // Optional: Add some users with email verification tokens (unverified users)
          emailVerificationToken: !isEmailVerified
            ? faker.string.uuid()
            : undefined,
        });
      }

      // Insert all users in batch
      const createdUsers = await this.userModel.insertMany(mockUsers);

      this.logger.log(`Successfully created ${createdUsers.length} mock users`);
      return createdUsers;
    } catch (error: any) {
      this.logger.error(
        `Failed to generate mock users: ${error?.message || 'Unknown error'}`,
        error?.stack,
      );
      throw error;
    }
  }

  async clearAllUsers(): Promise<void> {
    try {
      const result = await this.userModel.deleteMany({});
      this.logger.log(`Cleared ${result.deletedCount} users from database`);
    } catch (error: any) {
      this.logger.error(`Failed to clear users: ${error.message}`, error.stack);
      throw error;
    }
  }
}
