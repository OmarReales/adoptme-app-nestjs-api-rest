import { Controller, Post, Delete, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MockingService } from './mocking.service';
import { GenerateDataDto } from './dto/generate-data.dto';
import { CustomLoggerService } from '../../common/services/custom-logger.service';

@ApiTags('Mocking')
@Controller('mocking')
export class MockingController {
  constructor(
    private readonly mockingService: MockingService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Post('pets')
  @ApiOperation({
    summary: 'Generate mock pets',
    description:
      'Creates mock pets data for testing purposes. All pets will be available for adoption.',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: 'Number of pets to generate (default: 100, max: 1000)',
    example: 100,
  })
  @ApiResponse({
    status: 201,
    description: 'Mock pets created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid count parameter',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async generateMockPets(@Query('count') count?: string) {
    const requestedCount = count ? parseInt(count, 10) : 100;
    this.logger.info(
      `Received request to generate mock pets. Count: ${requestedCount}`,
      'MockingController',
    );

    try {
      // Validate count
      if (isNaN(requestedCount) || requestedCount <= 0) {
        this.logger.warn(
          `Invalid count: ${count}. Must be a positive number.`,
          'MockingController',
        );
        throw new Error('Count must be a positive number');
      }

      if (requestedCount > 1000) {
        this.logger.warn(
          `Count too high: ${requestedCount}. Maximum is 1000.`,
          'MockingController',
        );
        throw new Error('Maximum count is 1000');
      }

      const pets = await this.mockingService.generateMockPets(requestedCount);

      this.logger.logBusinessEvent(
        'mock_pets_generated',
        {
          count: pets.length,
          requestedCount,
          generatedAt: new Date().toISOString(),
        },
        'MockingController',
      );

      this.logger.info(
        `Successfully generated ${pets.length} mock pets`,
        'MockingController',
      );

      return {
        success: true,
        count: pets.length,
        message: `Successfully generated ${pets.length} mock pets`,
        data: pets,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error generating mock pets: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  @Delete('pets')
  @ApiOperation({
    summary: 'Clear all pets',
    description: 'Removes all pets from the database. Use with caution!',
  })
  @ApiResponse({
    status: 200,
    description: 'All pets cleared successfully',
  })
  async clearAllPets() {
    this.logger.log('Received request to clear all pets');

    try {
      await this.mockingService.clearAllPets();

      this.logger.log('Successfully cleared all pets');

      return {
        success: true,
        message: 'All pets have been cleared from the database',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error clearing pets: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  @Post('users')
  @ApiOperation({
    summary: 'Generate mock users',
    description:
      'Creates mock users data for testing purposes. Always includes default test users: user@adoptme.com (User123!) and admin@adoptme.com (Admin123!). Other users will have default password "password123".',
  })
  @ApiQuery({
    name: 'count',
    required: false,
    type: Number,
    description: 'Number of users to generate (default: 50, max: 500)',
    example: 50,
  })
  @ApiResponse({
    status: 201,
    description: 'Mock users created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid count parameter',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async generateMockUsers(@Query('count') count?: string) {
    const requestedCount = count ? parseInt(count, 10) : 50;

    this.logger.log(
      `Received request to generate mock users. Count: ${requestedCount}`,
    );

    try {
      // Validate count
      if (isNaN(requestedCount) || requestedCount <= 0) {
        this.logger.warn(`Invalid count: ${count}. Must be a positive number.`);
        throw new Error('Count must be a positive number');
      }

      if (requestedCount > 500) {
        this.logger.warn(`Count too high: ${requestedCount}. Maximum is 500.`);
        throw new Error('Maximum count is 500');
      }

      const users = await this.mockingService.generateMockUsers(requestedCount);

      this.logger.log(`Successfully generated ${users.length} mock users`);

      return {
        success: true,
        count: users.length,
        message: `Successfully generated ${users.length} mock users`,
        data: users,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error generating mock users: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  @Delete('users')
  @ApiOperation({
    summary: 'Clear all users',
    description: 'Removes all users from the database. Use with caution!',
  })
  @ApiResponse({
    status: 200,
    description: 'All users cleared successfully',
  })
  async clearAllUsers() {
    this.logger.log('Received request to clear all users');

    try {
      await this.mockingService.clearAllUsers();

      this.logger.log('Successfully cleared all users');

      return {
        success: true,
        message: 'All users have been cleared from the database',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error clearing users: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  @Post('generatedata')
  @ApiOperation({
    summary: 'Generate users and pets mock data',
    description:
      'Creates both users and pets mock data for testing purposes. Always includes default test users: user@adoptme.com (User123!) and admin@adoptme.com (Admin123!). This endpoint generates data in batch and provides summary information.',
  })
  @ApiResponse({
    status: 201,
    description: 'Mock data generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        summary: {
          type: 'object',
          properties: {
            usersGenerated: { type: 'number' },
            petsGenerated: { type: 'number' },
            totalRecords: { type: 'number' },
          },
        },
        links: {
          type: 'object',
          properties: {
            usersEndpoint: { type: 'string' },
            petsEndpoint: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async generateData(@Body() generateDataDto: GenerateDataDto) {
    const { users = 50, pets = 100 } = generateDataDto;

    this.logger.log(
      `Received request to generate mock data. Users: ${users}, Pets: ${pets}`,
    );

    try {
      let generatedUsers: any[] = [];
      let generatedPets: any[] = [];

      // Generate users first
      if (users > 0) {
        this.logger.log(`Generating ${users} mock users...`);
        generatedUsers = await this.mockingService.generateMockUsers(users);
      }

      // Then generate pets
      if (pets > 0) {
        this.logger.log(`Generating ${pets} mock pets...`);
        generatedPets = await this.mockingService.generateMockPets(pets);
      }

      const summary = {
        usersGenerated: generatedUsers.length,
        petsGenerated: generatedPets.length,
        totalRecords: generatedUsers.length + generatedPets.length,
      };

      this.logger.log(
        `Successfully generated mock data: ${summary.usersGenerated} users, ${summary.petsGenerated} pets`,
      );

      return {
        success: true,
        message: `Successfully generated ${summary.totalRecords} records (${summary.usersGenerated} users, ${summary.petsGenerated} pets)`,
        summary,
        links: {
          usersEndpoint: '/users',
          petsEndpoint: '/pets',
        },
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error generating mock data: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
