import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '../../schemas/user.schema';
import { CustomLoggerService } from '../../common/services/custom-logger.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.info(
      `Admin creating user: ${createUserDto.email}`,
      'UsersController',
    );

    const result = await this.usersService.create(createUserDto);

    this.logger.logBusinessEvent(
      'admin_user_created',
      {
        userId: String(result._id),
        email: createUserDto.email,
        username: createUserDto.username,
        role: createUserDto.role,
      },
      'UsersController',
    );

    return result;
  }
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@GetUser() user: any) {
    const userId = user.userId as string;
    this.logger.debug(
      `User accessing own profile: ${userId}`,
      'UsersController',
    );
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    this.logger.warn(`Admin deleting user: ${id}`, 'UsersController');

    await this.usersService.remove(id);

    this.logger.logBusinessEvent(
      'admin_user_deleted',
      {
        deletedUserId: id,
        action: 'delete_user',
      },
      'UsersController',
    );

    this.logger.warn(`User deleted successfully: ${id}`, 'UsersController');
  }
}
