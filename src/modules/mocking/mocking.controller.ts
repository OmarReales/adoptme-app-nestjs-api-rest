import { Controller, Post, Delete, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MockingService } from './mocking.service';

@ApiTags('Mocking')
@Controller('mocking')
export class MockingController {
  private readonly logger = new Logger(MockingController.name);

  constructor(private readonly mockingService: MockingService) {}

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

    this.logger.log(
      `Received request to generate mock pets. Count: ${requestedCount}`,
    );

    try {
      // Validate count
      if (isNaN(requestedCount) || requestedCount <= 0) {
        this.logger.warn(`Invalid count: ${count}. Must be a positive number.`);
        throw new Error('Count must be a positive number');
      }

      if (requestedCount > 1000) {
        this.logger.warn(`Count too high: ${requestedCount}. Maximum is 1000.`);
        throw new Error('Maximum count is 1000');
      }

      const pets = await this.mockingService.generateMockPets(requestedCount);

      this.logger.log(`Successfully generated ${pets.length} mock pets`);

      return {
        success: true,
        count: pets.length,
        message: `Successfully generated ${pets.length} mock pets`,
        data: pets,
      };
    } catch (error: any) {
      this.logger.error(
        `Error generating mock pets: ${error?.message || 'Unknown error'}`,
        error?.stack,
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
    } catch (error: any) {
      this.logger.error(
        `Error clearing pets: ${error?.message || 'Unknown error'}`,
        error?.stack,
      );
      throw error;
    }
  }

  @Post('users')
  @ApiOperation({
    summary: 'Generate mock users',
    description:
      'Creates mock users data for testing purposes. Users will have default password "password123".',
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
    } catch (error: any) {
      this.logger.error(
        `Error generating mock users: ${error?.message || 'Unknown error'}`,
        error?.stack,
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
    } catch (error: any) {
      this.logger.error(
        `Error clearing users: ${error?.message || 'Unknown error'}`,
        error?.stack,
      );
      throw error;
    }
  }
}
