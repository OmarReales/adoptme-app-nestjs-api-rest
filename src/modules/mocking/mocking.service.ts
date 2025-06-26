import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { Pet, PetStatus } from '../../schemas/pet.schema';
import { User, UserRole } from '../../schemas/user.schema';
import { CustomLoggerService } from '../../common/services/custom-logger.service';

@Injectable()
export class MockingService {
  constructor(
    @InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly logger: CustomLoggerService,
  ) {}

  async generateMockPets(count: number = 100): Promise<any[]> {
    this.logger.info(
      `Starting generation of ${count} mock pets`,
      'MockingService',
    );

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

        // Generate characteristics based on pet type
        const dogCharacteristics = [
          'friendly',
          'loyal',
          'energetic',
          'protective',
          'intelligent',
          'playful',
          'gentle',
          'trainable',
          'social',
          'active',
        ];

        const catCharacteristics = [
          'independent',
          'affectionate',
          'playful',
          'curious',
          'gentle',
          'quiet',
          'clean',
          'agile',
          'observant',
          'calm',
        ];

        const characteristicsList =
          petType.type === 'dog' ? dogCharacteristics : catCharacteristics;
        const selectedCharacteristics = faker.helpers.arrayElements(
          characteristicsList,
          faker.number.int({ min: 2, max: 4 }),
        );

        mockPets.push({
          name,
          breed,
          age,
          species: petType.type,
          gender: faker.helpers.arrayElement(['male', 'female']),
          owner: null,
          status: PetStatus.AVAILABLE,
          description,
          image: faker.image.urlLoremFlickr({
            category: petType.type,
            width: 400,
            height: 300,
          }),
          characteristics: selectedCharacteristics,
          likedBy: [],
        });
      }

      // Insert all pets in batch
      const createdPets = await this.petModel.insertMany(mockPets);

      this.logger.logDatabaseOperation(
        'create',
        'Pet',
        `Successfully created ${createdPets.length} mock pets`,
        'MockingService',
      );
      return createdPets;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to generate mock pets: ${errorMessage}`,
        'MockingService',
        errorStack,
      );
      throw error;
    }
  }

  async clearAllPets(): Promise<void> {
    try {
      this.logger.info('Starting deletion of all pets', 'MockingService');
      const result = await this.petModel.deleteMany({});

      this.logger.logDatabaseOperation(
        'delete',
        'Pet',
        `Cleared ${result.deletedCount} pets from database`,
        'MockingService',
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to clear pets: ${errorMessage}`,
        'MockingService',
        errorStack,
      );
      throw error;
    }
  }

  async generateMockUsers(count: number = 50): Promise<any[]> {
    this.logger.info(
      `Starting generation of ${count} mock users`,
      'MockingService',
    );

    try {
      const mockUsers: any[] = [];
      const hashedPassword = await bcrypt.hash('password123', 12);

      for (let i = 0; i < count; i++) {
        // Generate realistic user data with Faker
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();

        // Create username with some variation to avoid conflicts
        const baseUsername = faker.internet.username();
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

      this.logger.logDatabaseOperation(
        'create',
        'User',
        `Successfully created ${createdUsers.length} mock users`,
        'MockingService',
      );
      return createdUsers;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to generate mock users: ${errorMessage}`,
        'MockingService',
        errorStack,
      );
      throw error;
    }
  }

  async clearAllUsers(): Promise<void> {
    try {
      this.logger.info('Starting deletion of all users', 'MockingService');
      const result = await this.userModel.deleteMany({});

      this.logger.logDatabaseOperation(
        'delete',
        'User',
        `Cleared ${result.deletedCount} users from database`,
        'MockingService',
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to clear users: ${errorMessage}`,
        'MockingService',
        errorStack,
      );
      throw error;
    }
  }
}
