import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
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

      const dogBreeds = [
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
      ];

      const catBreeds = [
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
      ];

      const dogNames = [
        'Max',
        'Buddy',
        'Charlie',
        'Jack',
        'Cooper',
        'Rocky',
        'Toby',
        'Tucker',
        'Jake',
        'Bear',
        'Duke',
        'Teddy',
        'Oliver',
        'Riley',
        'Bailey',
        'Bentley',
        'Milo',
        'Buster',
        'Cody',
        'Dexter',
        'Winston',
        'Murphy',
        'Leo',
        'Lucky',
      ];

      const catNames = [
        'Luna',
        'Bella',
        'Oliver',
        'Charlie',
        'Lucy',
        'Max',
        'Kitty',
        'Jack',
        'Lily',
        'Sophie',
        'Tiger',
        'Princess',
        'Callie',
        'Shadow',
        'Smokey',
        'Molly',
        'Buddy',
        'Mittens',
        'Whiskers',
        'Angel',
        'Ginger',
        'Sammy',
      ];

      const descriptions = [
        'A friendly and playful companion perfect for families.',
        'Very energetic and loves to play fetch.',
        'Calm and gentle, great with children.',
        'Independent but affectionate when it wants to be.',
        'Loves to cuddle and is very loyal.',
        'Playful and curious, always exploring.',
        'Well-behaved and easy to train.',
        'Loves outdoor activities and long walks.',
        'Perfect lap companion, very affectionate.',
        'Great with other pets and very social.',
      ];

      for (let i = 0; i < count; i++) {
        const isdog = Math.random() > 0.5;
        const breeds = isdog ? dogBreeds : catBreeds;
        const names = isdog ? dogNames : catNames;

        const name = names[Math.floor(Math.random() * names.length)];
        const breed = breeds[Math.floor(Math.random() * breeds.length)];
        const age = Math.floor(Math.random() * 15) + 1; // 1-15 years
        const description =
          descriptions[Math.floor(Math.random() * descriptions.length)];

        mockPets.push({
          name: `${name}${i > names.length ? ` ${i}` : ''}`,
          breed,
          age,
          owner: null,
          status: PetStatus.AVAILABLE,
          description,
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

      const firstNames = [
        'John',
        'Jane',
        'Michael',
        'Sarah',
        'David',
        'Emma',
        'Chris',
        'Lisa',
        'Robert',
        'Maria',
        'James',
        'Anna',
        'William',
        'Jessica',
        'Richard',
        'Ashley',
        'Joseph',
        'Amanda',
        'Thomas',
        'Stephanie',
        'Charles',
        'Melissa',
        'Daniel',
        'Nicole',
        'Matthew',
        'Elizabeth',
        'Anthony',
        'Helen',
        'Mark',
        'Sandra',
        'Donald',
        'Donna',
        'Steven',
        'Carol',
        'Paul',
        'Ruth',
      ];

      const lastNames = [
        'Smith',
        'Johnson',
        'Williams',
        'Brown',
        'Jones',
        'Garcia',
        'Miller',
        'Davis',
        'Rodriguez',
        'Martinez',
        'Hernandez',
        'Lopez',
        'Gonzalez',
        'Wilson',
        'Anderson',
        'Thomas',
        'Taylor',
        'Moore',
        'Jackson',
        'Martin',
        'Lee',
        'Perez',
        'Thompson',
        'White',
        'Harris',
        'Sanchez',
        'Clark',
        'Ramirez',
        'Lewis',
        'Robinson',
        'Walker',
        'Young',
        'Allen',
        'King',
      ];

      const hashedPassword = await bcrypt.hash('password123', 12);

      for (let i = 0; i < count; i++) {
        const firstName =
          firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName =
          lastNames[Math.floor(Math.random() * lastNames.length)];
        const age = Math.floor(Math.random() * 50) + 18; // 18-67 years
        const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
        const email = `${username}@example.com`;

        mockUsers.push({
          username,
          firstname: firstName,
          lastname: lastName,
          email,
          password: hashedPassword,
          age,
          role: Math.random() > 0.9 ? UserRole.ADMIN : UserRole.USER, // 10% admins
          isEmailVerified: true,
        });
      }

      // Insert all users in batch
      const createdUsers = await this.userModel.insertMany(mockUsers);

      this.logger.log(`Successfully created ${createdUsers.length} mock users`);
      return createdUsers;
    } catch (error: any) {
      this.logger.error(
        `Failed to generate mock users: ${error.message}`,
        error.stack,
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
