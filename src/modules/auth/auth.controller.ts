import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { HybridAuthGuard } from '../../common/guards/hybrid-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import {
  LoginResponse,
  RegistrationResponse,
  SessionUser,
  AuthenticatedUser,
} from '../../common/interfaces/auth.interfaces';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<RegistrationResponse> {
    const clientIp = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    this.logger.info(
      `Registration attempt for email: ${createUserDto.email}`,
      'AuthController',
    );

    const result = await this.authService.register(createUserDto);

    // Create session user object
    const sessionUser: SessionUser = {
      id: String(result.user._id),
      username: result.user.username,
      firstName: result.user.firstname,
      lastName: result.user.lastname,
      email: result.user.email,
      role: result.user.role,
    };

    // Store user in session
    req.session.user = sessionUser;

    this.logger.logBusinessEvent(
      'user_registered',
      {
        userId: String(result.user._id),
        email: createUserDto.email,
        username: createUserDto.username,
        role: createUserDto.role,
        clientIp,
        userAgent,
      },
      'AuthController',
    );

    this.logger.info(
      `User registered successfully: ${String(result.user._id)}`,
      'AuthController',
    );

    // Return strongly typed response
    return {
      user: sessionUser,
      message: 'Registration successful',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponse> {
    const clientIp = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    this.logger.info(
      `Login attempt for email: ${loginDto.email}`,
      'AuthController',
    );

    const result = await this.authService.login(loginDto);

    // Create session user object
    const sessionUser: SessionUser = {
      id: String(result.user._id),
      username: result.user.username,
      firstName: result.user.firstname,
      lastName: result.user.lastname,
      email: result.user.email,
      role: result.user.role,
    };

    // Store user in session
    req.session.user = sessionUser;

    this.logger.logBusinessEvent(
      'user_login',
      {
        userId: String(result.user._id),
        email: loginDto.email,
        username: result.user.username,
        role: result.user.role,
        clientIp,
        userAgent,
        hasSession: !!req.session.user,
      },
      'AuthController',
      String(result.user._id),
    );

    this.logger.info(
      `User logged in successfully: ${String(result.user._id)}`,
      'AuthController',
    );

    // Return strongly typed response with user data + JWT token for hybrid authentication
    return {
      user: sessionUser,
      access_token: result.access_token, // JWT for API/Mobile clients
      message: 'Login successful',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully' })
  logout(@Req() req: Request) {
    const userId = req.session?.user?.id;

    req.session.destroy((err) => {
      if (err) {
        this.logger.error(
          `Error destroying session for user: ${userId}`,
          'AuthController',
        );
      } else {
        this.logger.info(
          `User logged out successfully: ${userId}`,
          'AuthController',
        );
      }
    });

    return { message: 'Logout successful' };
  }

  @Get('profile')
  @UseGuards(HybridAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@GetUser() user: AuthenticatedUser): AuthenticatedUser {
    this.logger.info(
      `Profile requested for user: ${user.userId}`,
      'AuthController',
    );

    return user;
  }

  @Get('test-hybrid')
  @UseGuards(HybridAuthGuard)
  @ApiOperation({ summary: 'Test hybrid authentication (Session OR JWT)' })
  @ApiResponse({
    status: 200,
    description: 'Hybrid authentication test successful',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  testHybridAuth(@GetUser() user: AuthenticatedUser | null) {
    if (!user) {
      // This shouldn't happen with the guard, but for type safety
      throw new Error('User not authenticated');
    }

    this.logger.info(
      `Hybrid auth successful for user: ${user.userId}`,
      'AuthController',
    );

    return {
      message: 'Hybrid authentication successful!',
      authMethod: user.firstName ? 'Session' : 'JWT', // Session has firstName, JWT doesn't
      user,
    };
  }
}
