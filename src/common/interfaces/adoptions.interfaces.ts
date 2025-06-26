import { AdoptionStatus } from '../../schemas/adoption.schema';

/**
 * Interfaces for populated adoption data
 */
export interface PopulatedPet {
  name: string;
  image: string;
  breed: string;
}

export interface PopulatedUser {
  firstname: string;
  lastname: string;
}

export interface PopulatedAdoption {
  _id: string;
  pet: PopulatedPet;
  user: PopulatedUser;
  notes?: string;
  approvedDate: Date;
  status: AdoptionStatus;
}

/**
 * Success story data structure for public consumption
 */
export interface SuccessStory {
  petName: string;
  image: string;
  familyName: string;
  story: string;
  adoptionDate: Date;
  breed: string;
}
