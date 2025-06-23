import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { UserSchema } from '../../src/schemas/user.schema';
import { PetSchema } from '../../src/schemas/pet.schema';
import { AdoptionSchema } from '../../src/schemas/adoption.schema';

// Test database configuration
export const TEST_DB_URI = 'mongodb://localhost:27017/adoptme-db-test';

export class TestDatabaseSetup {
  static async setupTestDatabase() {
    // Connect to test database
    await mongoose.connect(TEST_DB_URI);
    console.log('✅ Connected to test database');
  }
  static async cleanupDatabase() {
    // Clean all collections
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();

      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }

    console.log('🧹 Database cleaned');
  }

  static async closeConnection() {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }

  static getMongooseTestModule() {
    return MongooseModule.forRoot(TEST_DB_URI);
  }
  static getSchemaImports() {
    return [
      MongooseModule.forFeature([
        { name: 'User', schema: UserSchema },
        { name: 'Pet', schema: PetSchema },
        { name: 'Adoption', schema: AdoptionSchema },
      ]),
    ];
  }
}
