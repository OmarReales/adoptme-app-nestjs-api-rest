import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomLoggerService } from '../../common/services/custom-logger.service';

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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error creating user: ${errorMessage}`,
        'UsersService',
        errorStack,
      );
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.debug('Finding all users', 'UsersService');
    const users = await this.userModel.find().select('-password').exec();
    this.logger.debug(`Found ${users.length} users`, 'UsersService');
    return users;
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
    const { password, ...rest } = updateUserDto;

    const updateData: Partial<User> = { ...rest };

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
}
