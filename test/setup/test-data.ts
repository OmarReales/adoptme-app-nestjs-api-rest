/* eslint-disable @typescript-eslint/no-unsafe-return */
import { UserRole } from '../../src/schemas/user.schema';
import { PetStatus, PetSpecies, PetGender } from '../../src/schemas/pet.schema';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Test user data - 1 admin + 5 users
export const TEST_USERS = [
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    userName: 'admin_test',
    firstName: 'Admin',
    lastName: 'Test',
    email: 'admin@test.com',
    password: 'Admin123!',
    age: 30,
    role: UserRole.ADMIN,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    userName: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: 'User123!',
    age: 25,
    role: UserRole.USER,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    userName: 'jane_smith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@test.com',
    password: 'User123!',
    age: 28,
    role: UserRole.USER,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439014'),
    userName: 'bob_wilson',
    firstName: 'Bob',
    lastName: 'Wilson',
    email: 'bob@test.com',
    password: 'User123!',
    age: 35,
    role: UserRole.USER,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439015'),
    userName: 'alice_johnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@test.com',
    password: 'User123!',
    age: 22,
    role: UserRole.USER,
  },
  {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439016'),
    userName: 'charlie_brown',
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@test.com',
    password: 'User123!',
    age: 27,
    role: UserRole.USER,
  },
];

// Test pet data - 10 pets
export const TEST_PETS = [
  {
    _id: '507f1f77bcf86cd799439021',
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    species: PetSpecies.DOG,
    gender: PetGender.MALE,
    description: 'Friendly and energetic dog, loves to play fetch.',
    status: PetStatus.AVAILABLE,
    image: 'https://example.com/buddy.jpg',
    owner: null,
    likedBy: [],
  },
  {
    _id: '507f1f77bcf86cd799439022',
    name: 'Whiskers',
    breed: 'Persian Cat',
    age: 2,
    species: PetSpecies.CAT,
    gender: PetGender.FEMALE,
    description: 'Calm and affectionate cat, perfect for apartments.',
    status: PetStatus.AVAILABLE,
    image: 'https://example.com/whiskers.jpg',
    owner: null,
    likedBy: [],
  },
  {
    _id: '507f1f77bcf86cd799439023',
    name: 'Luna',
    breed: 'Husky',
    age: 4,
    species: PetSpecies.DOG,
    gender: PetGender.FEMALE,
    description: 'Active and intelligent dog, needs lots of exercise.',
    status: PetStatus.AVAILABLE,
    image: 'https://example.com/luna.jpg',
    owner: null,
    likedBy: ['507f1f77bcf86cd799439012'],
  },
  {
    _id: '507f1f77bcf86cd799439024',
    name: 'Max',
    breed: 'German Shepherd',
    age: 5,
    species: PetSpecies.DOG,
    gender: PetGender.MALE,
    description: 'Loyal and protective, great family dog.',
    status: PetStatus.ADOPTED,
    image: 'https://example.com/max.jpg',
    owner: '507f1f77bcf86cd799439012',
    likedBy: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
  },
  {
    _id: '507f1f77bcf86cd799439025',
    name: 'Bella',
    breed: 'Labrador',
    age: 1,
    species: PetSpecies.DOG,
    gender: PetGender.FEMALE,
    description: 'Young and playful puppy, loves everyone.',
    status: PetStatus.AVAILABLE,
    image: 'https://example.com/bella.jpg',
    owner: null,
    likedBy: ['507f1f77bcf86cd799439015'],
  },
  {
    _id: '507f1f77bcf86cd799439026',
    name: 'Milo',
    breed: 'Beagle',
    age: 6,
    species: PetSpecies.DOG,
    gender: PetGender.MALE,
    description: 'Gentle and calm, good with children.',
    status: PetStatus.AVAILABLE,
    image: 'https://example.com/milo.jpg',
    owner: null,
    likedBy: [],
  },
  {
    _id: '507f1f77bcf86cd799439027',
    name: 'Coco',
    breed: 'Poodle',
    age: 2,
    species: PetSpecies.DOG,
    gender: PetGender.FEMALE,
    description: 'Smart and hypoallergenic, great for families.',
    status: PetStatus.AVAILABLE,
    image: 'https://example.com/coco.jpg',
    owner: null,
    likedBy: ['507f1f77bcf86cd799439016'],
  },
  {
    _id: '507f1f77bcf86cd799439028',
    name: 'Rocky',
    breed: 'Bulldog',
    age: 4,
    species: PetSpecies.DOG,
    gender: PetGender.MALE,
    description: 'Laid-back and friendly, loves to relax.',
    status: PetStatus.AVAILABLE,
    image: 'https://example.com/rocky.jpg',
    owner: null,
    likedBy: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439015'],
  },
  {
    _id: '507f1f77bcf86cd799439029',
    name: 'Sadie',
    breed: 'Border Collie',
    age: 3,
    species: PetSpecies.DOG,
    gender: PetGender.FEMALE,
    description: 'Highly intelligent and active, needs mental stimulation.',
    status: PetStatus.AVAILABLE,
    image: 'https://example.com/sadie.jpg',
    owner: null,
    likedBy: [],
  },
  {
    _id: '507f1f77bcf86cd799439030',
    name: 'Oliver',
    breed: 'Maine Coon',
    age: 1,
    species: PetSpecies.CAT,
    gender: PetGender.MALE,
    description: 'Large and gentle cat, very social.',
    status: PetStatus.ADOPTED,
    image: 'https://example.com/oliver.jpg',
    owner: '507f1f77bcf86cd799439013',
    likedBy: ['507f1f77bcf86cd799439014', '507f1f77bcf86cd799439015'],
  },
];

// Helper to get hashed passwords for users
export async function getHashedTestUsers() {
  const users: any[] = [];
  for (const user of TEST_USERS) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    users.push({
      ...user,
      password: hashedPassword,
    });
  }
  return users;
}

// Commonly used test user credentials
export const TEST_ADMIN = {
  email: 'admin@test.com',
  password: 'Admin123!',
  id: '507f1f77bcf86cd799439011',
};

export const TEST_USER = {
  email: 'john@test.com',
  password: 'User123!',
  id: '507f1f77bcf86cd799439012',
};

export const TEST_USER_2 = {
  email: 'jane@test.com',
  password: 'User123!',
  id: '507f1f77bcf86cd799439013',
};

export const TEST_USER_3 = {
  email: 'bob@test.com',
  password: 'User123!',
  id: '507f1f77bcf86cd799439014',
};

export const TEST_USER_4 = {
  email: 'alice@test.com',
  password: 'User123!',
  id: '507f1f77bcf86cd799439015',
};

export class TestData {
  static async insertTestData(): Promise<void> {
    const User = mongoose.model('User');
    const Pet = mongoose.model('Pet');

    // Insert test users
    const hashedUsers = await getHashedTestUsers();
    await User.insertMany(hashedUsers);

    // Insert test pets
    await Pet.insertMany(TEST_PETS);

    console.log('✅ Test data inserted');
  }
}
