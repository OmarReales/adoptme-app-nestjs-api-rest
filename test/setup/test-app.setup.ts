import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';

import { TestDatabaseSetup } from './test-db.setup';
import { CommonModule } from '../../src/common/common.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { UsersModule } from '../../src/modules/users/users.module';
import { PetsModule } from '../../src/modules/pets/pets.module';

import { getHashedTestUsers, TEST_PETS } from './test-data';
import { User } from '../../src/schemas/user.schema';
import { Pet } from '../../src/schemas/pet.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class TestAppSetup {
  private static app: INestApplication;
  private static moduleRef: TestingModule;

  static async createTestApp(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Configuration
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
          load: [
            () => ({
              jwt: {
                secret: 'test-jwt-secret-for-testing-only',
                expiresIn: '7d',
              },
            }),
          ],
        }),

        // Rate limiting
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 1000, // Higher limit for testing
          },
        ]),

        // Database
        TestDatabaseSetup.getMongooseTestModule(),
        ...TestDatabaseSetup.getSchemaImports(),

        // Auth
        PassportModule,

        // Modules
        CommonModule,
        AuthModule,
        UsersModule,
        PetsModule,
      ],
    }).compile();

    this.moduleRef = moduleFixture;
    this.app = moduleFixture.createNestApplication();

    // Configure ValidationPipe globally for tests
    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await this.app.init();
    return this.app;
  }

  static async setupTestData(): Promise<void> {
    // Get models
    const userModel = this.moduleRef.get<Model<User>>(getModelToken('User'));
    const petModel = this.moduleRef.get<Model<Pet>>(getModelToken('Pet'));

    // Insert test users with hashed passwords
    const hashedUsers = await getHashedTestUsers();
    await userModel.insertMany(hashedUsers);

    // Insert test pets
    await petModel.insertMany(TEST_PETS);

    console.log('✅ Test data inserted');
  }

  static async closeTestApp(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }

  static getApp(): INestApplication {
    return this.app;
  }

  static getModuleRef(): TestingModule {
    return this.moduleRef;
  }
}
