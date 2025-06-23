import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '../../schemas/user.schema';
import { PetStatus } from '../../schemas/pet.schema';
import { CustomLoggerService } from '../../common/services/custom-logger.service';

@ApiTags('pets')
@Controller('pets')
export class PetsController {
  constructor(
    private readonly petsService: PetsService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pet (Admin only)' })
  @ApiResponse({ status: 201, description: 'Pet created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createPetDto: CreatePetDto) {
    this.logger.info(
      `Admin creating new pet: ${createPetDto.name} (${createPetDto.breed})`,
      'PetsController',
    );

    const result = await this.petsService.create(createPetDto);

    this.logger.logBusinessEvent(
      'pet_created',
      {
        petId: String(result._id),
        petName: createPetDto.name,
        breed: createPetDto.breed,
        age: createPetDto.age,
      },
      'PetsController',
    );

    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Get all pets with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PetStatus,
    example: PetStatus.AVAILABLE,
  })
  @ApiQuery({
    name: 'breed',
    required: false,
    type: String,
    example: 'Golden Retriever',
  })
  @ApiResponse({ status: 200, description: 'Pets retrieved successfully' })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: PetStatus,
    @Query('breed') breed?: string,
  ) {
    return this.petsService.findAll(page, limit, status, breed);
  }

  @Get('my-pets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pets owned by current user' })
  @ApiResponse({ status: 200, description: 'User pets retrieved successfully' })
  async getUserPets(@GetUser() user: any) {
    const userId = user.userId as string;
    this.logger.debug(`Getting pets for user: ${userId}`, 'PetsController');
    return this.petsService.getUserPets(userId);
  }

  @Get('my-liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pets liked by current user' })
  @ApiResponse({
    status: 200,
    description: 'User liked pets retrieved successfully',
  })
  async getUserLikedPets(@GetUser() user: any) {
    const userId = user.userId as string;
    this.logger.debug(
      `Getting liked pets for user: ${userId}`,
      'PetsController',
    );
    return this.petsService.getUserLikedPets(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pet by ID' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @ApiResponse({ status: 200, description: 'Pet retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pet (Admin only)' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @ApiResponse({ status: 200, description: 'Pet updated successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(id, updatePetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete pet (Admin only)' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @ApiResponse({ status: 200, description: 'Pet deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Cannot delete adopted pet',
  })
  remove(@Param('id') id: string) {
    return this.petsService.remove(id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a pet' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @ApiResponse({ status: 200, description: 'Pet liked successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiResponse({ status: 409, description: 'Pet already liked' })
  async likePet(@Param('id') id: string, @GetUser() user: any) {
    const userId = user.userId as string;

    this.logger.info(`User ${userId} liking pet ${id}`, 'PetsController');

    const result = await this.petsService.likePet(id, userId);

    this.logger.logBusinessEvent(
      'pet_liked',
      {
        petId: id,
        userId,
        action: 'like',
      },
      'PetsController',
      userId,
    );

    return result;
  }
  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a pet' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  @ApiResponse({ status: 200, description: 'Pet unliked successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiResponse({ status: 409, description: 'Pet not liked by user' })
  async unlikePet(@Param('id') id: string, @GetUser() user: any) {
    const userId = user.userId as string;

    this.logger.info(`User ${userId} unliking pet ${id}`, 'PetsController');

    const result = await this.petsService.unlikePet(id, userId);

    this.logger.logBusinessEvent(
      'pet_unliked',
      {
        petId: id,
        userId,
        action: 'unlike',
      },
      'PetsController',
      userId,
    );

    return result;
  }
}
