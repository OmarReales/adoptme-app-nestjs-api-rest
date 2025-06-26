import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import {
  Pet,
  PetStatus,
  PetSpecies,
  PetGender,
} from '../../schemas/pet.schema';
import { User, UserRole } from '../../schemas/user.schema';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import {
  MockPet,
  MockUser,
  PetTypeDefinition,
  GenerationSummary,
} from '../../common/interfaces/mocking.interfaces';

// Default test users that will always be created
const DEFAULT_TEST_USERS = [
  {
    username: 'testuser',
    firstname: 'Test',
    lastname: 'User',
    email: 'user@adoptme.com',
    password: 'User123!',
    age: 25,
    role: UserRole.USER,
    isEmailVerified: true,
    emailVerificationToken: undefined,
  },
  {
    username: 'testadmin',
    firstname: 'Test',
    lastname: 'Admin',
    email: 'admin@adoptme.com',
    password: 'Admin123!',
    age: 30,
    role: UserRole.ADMIN,
    isEmailVerified: true,
    emailVerificationToken: undefined,
  },
] as const;

@Injectable()
export class MockingService {
  constructor(
    @InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly logger: CustomLoggerService,
  ) {}

  async generateMockPets(count: number = 100): Promise<MockPet[]> {
    this.logger.info(
      `Starting generation of ${count} mock pets`,
      'MockingService',
    );

    try {
      const mockPets: MockPet[] = [];

      // Define pet types with their common breeds
      const petTypes: PetTypeDefinition[] = [
        {
          type: PetSpecies.DOG,
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
          type: PetSpecies.CAT,
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
          petType.type === PetSpecies.DOG
            ? dogCharacteristics
            : catCharacteristics;
        const selectedCharacteristics = faker.helpers.arrayElements(
          characteristicsList,
          faker.number.int({ min: 2, max: 4 }),
        );

        mockPets.push({
          name,
          breed,
          age,
          species: petType.type,
          gender: faker.helpers.arrayElement([
            PetGender.MALE,
            PetGender.FEMALE,
          ]),
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

  async generateMockUsers(count: number = 50): Promise<MockUser[]> {
    this.logger.info(
      `Starting generation of ${count} mock users`,
      'MockingService',
    );

    try {
      // First, create/update default test users
      await this.ensureDefaultTestUsers();

      const mockUsers: MockUser[] = [];
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
        `Successfully created ${createdUsers.length} mock users (+ 2 default test users)`,
        'MockingService',
      );

      // Return all created users including the default test users
      const allUsers = await this.userModel
        .find({
          email: { $in: ['user@adoptme.com', 'admin@adoptme.com'] },
        })
        .lean();

      return [...allUsers, ...createdUsers];
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

  /**
   * Ensures the default test users exist in the database.
   * If they exist, they are deleted and recreated to avoid conflicts.
   * These users are always created for consistent testing.
   */
  private async ensureDefaultTestUsers(): Promise<void> {
    this.logger.info(
      'Ensuring default test users are created/updated',
      'MockingService',
    );

    try {
      // Delete existing test users if they exist
      const testEmails = DEFAULT_TEST_USERS.map((user) => user.email);
      const deleteResult = await this.userModel.deleteMany({
        email: { $in: testEmails },
      });

      if (deleteResult.deletedCount > 0) {
        this.logger.info(
          `Removed ${deleteResult.deletedCount} existing test users`,
          'MockingService',
        );
      }

      // Create test users with hashed passwords
      const testUsers = await Promise.all(
        DEFAULT_TEST_USERS.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 12),
        })),
      );

      // Insert default test users
      const createdTestUsers = await this.userModel.insertMany(testUsers);

      this.logger.logDatabaseOperation(
        'create',
        'User',
        `Successfully created/updated ${createdTestUsers.length} default test users`,
        'MockingService',
      );

      this.logger.info(
        `Default test users ready: user@adoptme.com (User123!), admin@adoptme.com (Admin123!)`,
        'MockingService',
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Failed to ensure default test users: ${errorMessage}`,
        'MockingService',
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Generate complete mock data including both pets and users
   */
  async generateCompleteDataSet(
    petCount: number = 100,
    userCount: number = 50,
  ): Promise<GenerationSummary> {
    this.logger.info(
      `Starting complete data generation: ${userCount} users, ${petCount} pets`,
      'MockingService',
    );

    try {
      const users = await this.generateMockUsers(userCount);
      const pets = await this.generateMockPets(petCount);

      const summary: GenerationSummary = {
        usersGenerated: users.length,
        petsGenerated: pets.length,
        totalRecords: users.length + pets.length,
      };

      this.logger.info(
        `Complete data generation finished: ${summary.totalRecords} total records`,
        'MockingService',
      );

      return summary;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate complete data set: ${errorMessage}`,
        'MockingService',
      );
      throw error;
    }
  }
}
