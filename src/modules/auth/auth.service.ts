import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from '../../schemas/user.schema';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { ErrorHandlerUtil } from '../../common/utils/error-handler.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly logger: CustomLoggerService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, userName, password, ...rest } = createUserDto;

    this.logger.debug(
      `Registration attempt for email: ${email}`,
      'AuthService',
    );

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      this.logger.logAuthentication('failed_login', undefined, email);
      this.logger.warn(
        `Registration failed - user already exists: ${email}`,
        'AuthService',
      );
      throw new ConflictException(
        'User with this email or userName already exists',
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new this.userModel({
      ...rest,
      email,
      userName,
      password: hashedPassword,
    });

    await user.save();

    const userId = String(user._id);
    this.logger.logAuthentication('register', userId, email);
    this.logger.info(`User registered successfully: ${userId}`, 'AuthService');

    // Generate JWT token for hybrid authentication
    const payload = {
      sub: userId,
      userName: user.userName,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // Return user data without password + JWT token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = user.toObject();
    return {
      user: userWithoutPassword,
      access_token: accessToken, // JWT para API/Mobile
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    this.logger.debug(`Login attempt for email: ${email}`, 'AuthService');

    // Find user by email
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) {
      this.logger.logAuthentication('failed_login', undefined, email);
      this.logger.warn(
        `Login failed - user not found: ${email}`,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.logAuthentication('failed_login', String(user._id), email);
      this.logger.warn(
        `Login failed - invalid password: ${email}`,
        'AuthService',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const userId = String(user._id);
    const payload = {
      sub: userId,
      userName: user.userName,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // Update last connection
    await this.userModel.findByIdAndUpdate(user._id, {
      lastConnection: new Date(),
    });

    this.logger.logAuthentication('login', userId, email);
    this.logger.info(`User logged in successfully: ${userId}`, 'AuthService');

    // Return user data without password + JWT token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pwd, ...userWithoutPassword } = user.toObject();
    return {
      user: userWithoutPassword,
      access_token: accessToken, // JWT para API/Mobile
    };
  }

  async validateUser(userId: string) {
    ErrorHandlerUtil.validateObjectId(userId, 'user ID');

    this.logger.debug(`Validating user: ${userId}`, 'AuthService');
    const user = await this.userModel.findById(userId).select('-password');

    if (user) {
      this.logger.debug(`User validation successful: ${userId}`, 'AuthService');
    } else {
      this.logger.warn(
        `User validation failed - user not found: ${userId}`,
        'AuthService',
      );
    }

    return user;
  }
}
