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
import { AdoptionsService } from './adoptions.service';
import { CreateAdoptionDto, UpdateAdoptionDto } from './dto/adoption.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RequestUser } from '../../common/interfaces/common.interfaces';
import { UserRole } from '../../schemas/user.schema';
import { AdoptionStatus } from '../../schemas/adoption.schema';

@ApiTags('adoptions')
@Controller('adoptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdoptionsController {
  constructor(private readonly adoptionsService: AdoptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create adoption request' })
  @ApiResponse({
    status: 201,
    description: 'Adoption request created successfully',
  })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  @ApiResponse({
    status: 409,
    description: 'Pet not available or duplicate request',
  })
  create(
    @Body() createAdoptionDto: CreateAdoptionDto,
    @GetUser() user: RequestUser,
  ) {
    return this.adoptionsService.create(createAdoptionDto, user.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all adoption requests (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AdoptionStatus,
    example: AdoptionStatus.PENDING,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    example: '64f8b5c2e4b0a8f2c1d3e4f5',
  })
  @ApiResponse({
    status: 200,
    description: 'Adoption requests retrieved successfully',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('status') status?: AdoptionStatus,
    @Query('userId') userId?: string,
  ) {
    return this.adoptionsService.findAll(page, limit, status, userId);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get current user adoption requests' })
  @ApiResponse({
    status: 200,
    description: 'User adoption requests retrieved successfully',
  })
  getUserAdoptions(@GetUser() user: RequestUser) {
    return this.adoptionsService.getUserAdoptions(user.userId);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pending adoption requests (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Pending adoption requests retrieved successfully',
  })
  getPendingAdoptions() {
    return this.adoptionsService.getPendingAdoptions();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get adoption statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Adoption statistics retrieved successfully',
  })
  getAdoptionStats() {
    return this.adoptionsService.getAdoptionStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get adoption request by ID' })
  @ApiParam({ name: 'id', description: 'Adoption ID' })
  @ApiResponse({
    status: 200,
    description: 'Adoption request retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Adoption request not found' })
  findOne(@Param('id') id: string) {
    return this.adoptionsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update adoption request status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Adoption ID' })
  @ApiResponse({
    status: 200,
    description: 'Adoption status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Adoption request not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot update non-pending adoption',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateAdoptionDto: UpdateAdoptionDto,
    @GetUser() admin: RequestUser,
  ) {
    return this.adoptionsService.updateStatus(
      id,
      updateAdoptionDto,
      admin.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete adoption request' })
  @ApiParam({ name: 'id', description: 'Adoption ID' })
  @ApiResponse({
    status: 200,
    description: 'Adoption request deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Adoption request not found' })
  @ApiResponse({
    status: 403,
    description: 'Can only delete own adoption requests',
  })
  @ApiResponse({
    status: 409,
    description: 'Can only delete pending adoption requests',
  })
  remove(@Param('id') id: string, @GetUser() user: RequestUser) {
    return this.adoptionsService.remove(id, user.userId, user.role);
  }
}
