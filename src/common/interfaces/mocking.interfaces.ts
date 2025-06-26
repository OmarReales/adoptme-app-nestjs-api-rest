import { PetStatus, PetSpecies, PetGender } from '../../schemas/pet.schema';
import { UserRole } from '../../schemas/user.schema';
import { Types } from 'mongoose';

/**
 * Mock pet data structure for generation
 */
export interface MockPet {
  name: string;
  breed: string;
  age: number;
  species: PetSpecies;
  gender: PetGender;
  owner: Types.ObjectId | null;
  status: PetStatus;
  description?: string;
  image?: string;
  characteristics: string[];
  likedBy: Types.ObjectId[];
}

/**
 * Mock user data structure for generation
 */
export interface MockUser {
  username: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  age: number;
  role: UserRole;
  phone?: string;
  address?: string;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
}

/**
 * Pet type definition for generation
 */
export interface PetTypeDefinition {
  type: PetSpecies;
  breeds: string[];
}

/**
 * Generation summary interface
 */
export interface GenerationSummary {
  usersGenerated: number;
  petsGenerated: number;
  totalRecords: number;
}
