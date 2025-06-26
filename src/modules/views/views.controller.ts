import { Controller, Get, Render, Query } from '@nestjs/common';
import { StatsService } from '../stats/stats.service';
import { PetsService } from '../pets/pets.service';
import { AdoptionsService } from '../adoptions/adoptions.service';

@Controller()
export class ViewsController {
  constructor(
    private readonly statsService: StatsService,
    private readonly petsService: PetsService,
    private readonly adoptionsService: AdoptionsService,
  ) {}

  @Get('/')
  @Render('index')
  async home() {
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

  @Get('/view-pets')
  @Render('pets/index')
  async pets(
    @Query('page') page = '1',
    @Query('limit') limit = '24',
    @Query('species') species?: string,
    @Query('name') name?: string,
    @Query('ageRange') ageRange?: string,
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const petsData = await this.petsService.findAll(
      pageNumber,
      limitNumber,
      undefined, // status
      undefined, // breed
      species,
      name,
      ageRange,
    );
    const stats = await this.statsService.getAppStats();

    return {
      title: 'Mascotas',
      currentPage: 'pets',
      pets: petsData.data,
      pagination: petsData.pagination,
      stats: {
        availablePets: stats.availablePets,
        adoptedPets: stats.adoptedPets,
        totalPets: stats.totalPets,
      },
      scripts: ['/js/pets.js'],
    };
  }

  @Get('/view-adoptions')
  @Render('adoptions/index')
  async adoptions(@Query('page') page = '1', @Query('limit') limit = '10') {
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
      pendingAdoptions: pendingAdoptions.slice(0, 5), // Mostrar solo los primeros 5
      successStories, // Real success stories from the DB
      scripts: ['/js/adoptions.js'],
    };
  }

  @Get('/login')
  @Render('auth/login')
  login() {
    return {
      title: 'Iniciar Sesión',
      currentPage: 'login',
      scripts: ['/js/auth.js'],
    };
  }

  @Get('/register')
  @Render('auth/register')
  register() {
    return {
      title: 'Registrarse',
      currentPage: 'register',
      scripts: ['/js/auth.js'],
    };
  }
}
