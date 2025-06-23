import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CustomLoggerService } from '../../common/services/custom-logger.service';

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
  async register(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const clientIp = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    this.logger.info(
      `Registration attempt for email: ${createUserDto.email}`,
      'AuthController',
    );

    const result = await this.authService.register(createUserDto);

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

    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const clientIp = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    this.logger.info(
      `Login attempt for email: ${loginDto.email}`,
      'AuthController',
    );

    const result = await this.authService.login(loginDto);

    this.logger.logBusinessEvent(
      'user_login',
      {
        userId: String(result.user._id),
        email: loginDto.email,
        username: result.user.username,
        role: result.user.role,
        clientIp,
        userAgent,
        hasToken: !!result.access_token,
      },
      'AuthController',
      String(result.user._id),
    );

    this.logger.info(
      `User logged in successfully: ${String(result.user._id)}`,
      'AuthController',
    );

    return result;
  }
}
