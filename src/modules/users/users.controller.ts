import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ForbiddenException,
  Query,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '../../schemas/user.schema';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { AuthenticatedUser } from '../../common/interfaces/auth.interfaces';
import { getDocumentUploadConfig } from '../../common/middleware/file-upload.middleware';

@ApiTags('users')
@Controller('users')
@UseGuards(HybridAuthGuard)
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
        userName: createUserDto.userName,
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
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.usersService.findAll({
      page: pageNum,
      limit: limitNum,
      role,
    });

    return result;
  }

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@GetUser() user: AuthenticatedUser | null) {
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    this.logger.debug(
      `User accessing own profile: ${user.userId}`,
      'UsersController',
    );
    return this.usersService.findOne(user.userId);
  }

  @Patch('profile/me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateCurrentUserProfile(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = user.userId as string;
    return this.usersService.update(userId, updateUserDto);
  }

  @Put('profile/me')
  @ApiOperation({ summary: 'Update current user profile (PUT)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateCurrentUserProfilePut(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const userId = user.userId as string;
    return this.usersService.update(userId, updateUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string, @GetUser() user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = user.userId as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserRole = user.role as string;

    // Users can only access their own profile, admins can access any profile
    if (currentUserRole !== 'admin' && currentUserId !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }

    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = user.userId as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserRole = user.role as string;

    // Users can only update their own profile, admins can update any profile
    if (currentUserRole !== 'admin' && currentUserId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (PUT)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updatePut(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = user.userId as string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserRole = user.role as string;

    // Users can only update their own profile, admins can update any profile
    if (currentUserRole !== 'admin' && currentUserId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

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

    return {
      message: 'User deleted successfully',
      id,
    };
  }

  @Post(':uid/documents')
  @HttpCode(201)
  @UseInterceptors(FilesInterceptor('documents', 5, getDocumentUploadConfig()))
  @ApiOperation({ summary: 'Upload documents for a user' })
  @ApiResponse({ status: 201, description: 'Documents uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files or request' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Cannot upload documents for another user',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async uploadDocuments(
    @Param('uid') uid: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @GetUser() user: AuthenticatedUser | null,
  ) {
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Users can only upload documents to their own profile, admins can upload to any profile
    if (user.role !== UserRole.ADMIN && user.userId !== uid) {
      throw new ForbiddenException(
        'You can only upload documents to your own profile',
      );
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    this.logger.info(
      `User ${user.userId} uploading ${files.length} documents for user ${uid}`,
      'UsersController',
    );

    const result = await this.usersService.uploadDocuments(uid, files);

    this.logger.logBusinessEvent(
      'user_documents_uploaded',
      {
        userId: uid,
        uploadedBy: user.userId,
        filesCount: files.length,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        fileNames: files.map((file) => (file as any).originalName),
      },
      'UsersController',
    );

    return {
      message: 'Documents uploaded successfully',
      documentsCount: files.length,
      user: result,
    };
  }
}
