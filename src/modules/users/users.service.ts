import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { ErrorHandlerUtil } from '../../common/utils/error-handler.util';
import { getPublicFileUrl } from '../../common/middleware/file-upload.middleware';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly logger: CustomLoggerService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.info(
      `Creating new user with email: ${createUserDto.email}`,
      'UsersService',
    );

    try {
      const { password, ...rest } = createUserDto;

      // Check if user already exists
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: createUserDto.email },
          { username: createUserDto.username },
        ],
      });

      if (existingUser) {
        this.logger.warn(
          `User creation failed: email or username already exists for ${createUserDto.email}`,
          'UsersService',
        );
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new this.userModel({
        ...rest,
        password: hashedPassword,
      });

      const savedUser = await user.save();
      const userId = String(savedUser._id);

      this.logger.logDatabaseOperation(
        'create',
        'User',
        `User created successfully with ID: ${userId}`,
        'UsersService',
      );
      return savedUser;
    } catch (error: unknown) {
      ErrorHandlerUtil.handleDatabaseError(
        error,
        'create',
        'User',
        'UsersService',
        this.logger,
      );
    }
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    role?: string;
  }): Promise<{
    data: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    this.logger.debug('Finding all users', 'UsersService');

    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = {};
    if (options?.role) {
      filter.role = options.role;
    }

    // Get total count for pagination
    const total = await this.userModel.countDocuments(filter).exec();

    // Get users with pagination
    const users = await this.userModel
      .find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);

    this.logger.debug(`Found ${users.length} users`, 'UsersService');

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<User> {
    this.logger.debug(`Finding user by ID: ${id}`, 'UsersService');
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`, 'UsersService');
      throw new NotFoundException('User not found');
    }
    this.logger.debug(`User found: ${id}`, 'UsersService');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`, 'UsersService');
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<User | null> {
    this.logger.debug(`Finding user by username: ${username}`, 'UsersService');
    return this.userModel.findOne({ username }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.info(`Updating user: ${id}`, 'UsersService');
    const { password, email, username, ...rest } = updateUserDto;

    // Check if email or username already exists (excluding the current user)
    if (email || username) {
      const existingUser = await this.userModel.findOne({
        _id: { $ne: id },
        $or: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
        ],
      });

      if (existingUser) {
        this.logger.warn(
          `Update failed: email or username already exists for user ${id}`,
          'UsersService',
        );
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }
    }

    const updateData: Partial<User> = { ...rest };

    // Add email and username to update data if provided
    if (email) updateData.email = email;
    if (username) updateData.username = username;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      this.logger.warn(`User not found for update: ${id}`, 'UsersService');
      throw new NotFoundException('User not found');
    }

    this.logger.logDatabaseOperation(
      'update',
      'User',
      `User updated successfully: ${id}`,
      'UsersService',
    );
    return user;
  }

  async remove(id: string): Promise<void> {
    this.logger.info(`Removing user: ${id}`, 'UsersService');
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      this.logger.warn(`User not found for removal: ${id}`, 'UsersService');
      throw new NotFoundException('User not found');
    }
    this.logger.logDatabaseOperation(
      'delete',
      'User',
      `User removed successfully: ${id}`,
      'UsersService',
    );
  }

  async uploadDocuments(userId: string, files: any[]): Promise<User> {
    this.logger.info(
      `Uploading ${files.length} documents for user: ${userId}`,
      'UsersService',
    );

    ErrorHandlerUtil.validateObjectId(userId, 'user ID');

    // Validate that user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      this.logger.warn(
        `User not found for document upload: ${userId}`,
        'UsersService',
      );
      throw new NotFoundException('User not found');
    }

    // Validate files
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Create document objects
    /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    const newDocuments: UserDocument[] = files.map((file) => ({
      name: file.originalname,
      reference: getPublicFileUrl(file.path),
      uploadDate: new Date(),
      size: file.size,
      mimeType: file.mimetype,
    }));
    /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

    // Update user with new documents
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $push: { documents: { $each: newDocuments } },
        },
        { new: true, runValidators: true },
      )
      .select('-password');

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    this.logger.logDatabaseOperation(
      'update',
      'User',
      `Documents uploaded successfully for user: ${userId}, count: ${files.length}`,
      'UsersService',
    );

    this.logger.info(
      `Successfully uploaded ${files.length} documents for user: ${userId}`,
      'UsersService',
    );

    return updatedUser;
  }
}
