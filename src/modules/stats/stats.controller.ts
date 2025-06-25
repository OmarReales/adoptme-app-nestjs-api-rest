import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsService, AppStats, AdoptionStats } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get application statistics' })
  @ApiResponse({
    status: 200,
    description: 'Application statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalPets: { type: 'number' },
        totalAdoptions: { type: 'number' },
        totalUsers: { type: 'number' },
        totalNotifications: { type: 'number' },
        availablePets: { type: 'number' },
        adoptedPets: { type: 'number' },
        pendingAdoptions: { type: 'number' },
        approvedAdoptions: { type: 'number' },
        rejectedAdoptions: { type: 'number' },
      },
    },
  })
  getAppStats(): Promise<AppStats> {
    return this.statsService.getAppStats();
  }

  @Get('adoptions')
  @ApiOperation({ summary: 'Get adoption-specific statistics' })
  @ApiResponse({
    status: 200,
    description: 'Adoption statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalAdoptions: { type: 'number' },
        pendingAdoptions: { type: 'number' },
        happyFamilies: { type: 'number' },
      },
    },
  })
  getAdoptionStats(): Promise<AdoptionStats> {
    return this.statsService.getAdoptionStats();
  }
}
