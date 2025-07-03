import { Injectable } from '@nestjs/common';
import { StatsService } from '../stats/stats.service';
import { PetsService } from '../pets/pets.service';
import { AdoptionsService } from '../adoptions/adoptions.service';
import { UsersService } from '../users/users.service';
import { AuthenticatedUser } from '../../common/interfaces/auth.interfaces';
import { AdoptionStatus } from '../../schemas/adoption.schema';
import { PetStatus } from '../../schemas/pet.schema';

@Injectable()
export class ViewsService {
  constructor(
    private readonly statsService: StatsService,
    private readonly petsService: PetsService,
    private readonly adoptionsService: AdoptionsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Prepares data for the home page
   */
  async prepareHomeData() {
    const stats = await this.statsService.getAppStats();

    return {
      title: 'Inicio',
      currentPage: 'home',
      stats: {
        totalPets: stats.totalPets,
        totalAdoptions: stats.approvedAdoptions,
        totalUsers: stats.totalUsers,
        totalNotifications: stats.totalNotifications,
      },
      scripts: ['/js/home.js'],
    };
  }

  /**
   * Prepares data for the pets page
   */
  async preparePetsData(
    page = '1',
    limit = '24',
    species?: string,
    name?: string,
    ageRange?: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Convert species string to PetStatus if necessary
    let petStatus: PetStatus | undefined;
    if (species && Object.values(PetStatus).includes(species as PetStatus)) {
      petStatus = species as PetStatus;
    }

    const petsData = await this.petsService.findAll(
      pageNumber,
      limitNumber,
      petStatus,
      undefined, // breed
      species,
      name,
      ageRange,
    );

    // Create pagination object compatible with the view
    const totalPages = Math.ceil(petsData.pagination.total / limitNumber);
    const pagination = {
      page: pageNumber,
      limit: limitNumber,
      total: petsData.pagination.total,
      totalPages,
      hasNext: pageNumber < totalPages,
      hasPrev: pageNumber > 1,
      nextPage: pageNumber + 1,
      prevPage: pageNumber - 1,
    };

    return {
      title: 'Mascotas',
      currentPage: 'pets',
      pets: petsData.data,
      pagination,
      filters: {
        species,
        name,
        ageRange,
      },
      scripts: ['/js/pets.js'],
    };
  }

  /**
   * Prepares data for the adoptions page
   */
  async prepareAdoptionsData(page = '1', limit = '10') {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const adoptionsData = await this.adoptionsService.findAll(
      pageNumber,
      limitNumber,
    );
    const adoptionStats = await this.statsService.getAdoptionStats();
    const pendingAdoptions = await this.adoptionsService.getPendingAdoptions();

    // Create pagination object compatible with the view
    const totalPages = Math.ceil(adoptionsData.total / limitNumber);
    const pagination = {
      page: pageNumber,
      limit: limitNumber,
      total: adoptionsData.total,
      totalPages,
      hasNext: pageNumber < totalPages,
      hasPrev: pageNumber > 1,
      nextPage: pageNumber + 1,
      prevPage: pageNumber - 1,
    };

    const successStories = await this.adoptionsService.getSuccessStories(3);

    return {
      title: 'Adopciones',
      currentPage: 'adoptions',
      adoptions: adoptionsData.adoptions,
      pagination,
      stats: adoptionStats,
      pendingAdoptions: pendingAdoptions.slice(0, 5), // Show only the first 5
      successStories, // Real success stories from the DB
      scripts: ['/js/adoptions.js'],
    };
  }

  /**
   * Prepares data for the login page
   */
  prepareLoginData() {
    return {
      title: 'Iniciar Sesión',
      currentPage: 'login',
      scripts: ['/js/auth.js'],
    };
  }

  /**
   * Prepares data for the register page
   */
  prepareRegisterData() {
    return {
      title: 'Registrarse',
      currentPage: 'register',
      scripts: ['/js/auth.js'],
    };
  }

  /**
   * Prepares data for the user profile page
   */
  async prepareProfileData(user: AuthenticatedUser) {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile data
    const profileData = await this.usersService.findOne(user.userId);

    // Get user adoption statistics
    const userAdoptions = await this.adoptionsService.getUserAdoptions(
      user.userId,
    );

    // Calculate personal statistics
    const stats = this.calculateUserStats(userAdoptions);

    return {
      title: 'Mi Perfil',
      currentPage: 'profile',
      user: profileData,
      stats,
      scripts: ['/js/profile.js'],
    };
  }

  /**
   * Calculates user personal statistics based on their adoptions
   */
  private calculateUserStats(userAdoptions: any[]) {
    return {
      total: userAdoptions.length,
      approved: userAdoptions.filter(
        (adoption) => adoption.status === AdoptionStatus.APPROVED,
      ).length,
      pending: userAdoptions.filter(
        (adoption) => adoption.status === AdoptionStatus.PENDING,
      ).length,
      rejected: userAdoptions.filter(
        (adoption) => adoption.status === AdoptionStatus.REJECTED,
      ).length,
    };
  }

  /**
   * Creates a standard pagination object for views
   */
  private createPagination(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    };
  }

  /**
   * Validates and converts pagination parameters
   */
  private parsePaginationParams(page?: string, limit?: string) {
    const pageNumber = parseInt(page || '1', 10);
    const limitNumber = parseInt(limit || '10', 10);

    // Basic validation
    const validPage = Math.max(1, pageNumber);
    const validLimit = Math.min(Math.max(1, limitNumber), 100); // Maximum 100 items per page

    return { page: validPage, limit: validLimit };
  }

  /**
   * Helper method to validate search filters
   */
  private sanitizeFilters(filters: Record<string, any>) {
    const sanitized: Record<string, any> = {};

    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}
