/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect, use } from 'chai';
import sinonChai from 'sinon-chai';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as sinon from 'sinon';
import * as bcrypt from 'bcryptjs';

import { AuthService } from '../../../src/modules/auth/auth.service';
import { User } from '../../../src/schemas/user.schema';
import { CustomLoggerService } from '../../../src/common/services/custom-logger.service';
import { CreateUserDto } from '../../../src/modules/users/dto/create-user.dto';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';

use(sinonChai);

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let jwtService: any;
  let logger: any;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstname: 'Test',
    lastname: 'User',
    age: 25,
    role: 'user',
    toObject: sinon.stub().returns({
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      email: 'test@example.com',
      firstname: 'Test',
      lastname: 'User',
      age: 25,
      role: 'user',
    }),
    save: sinon.stub(),
  };

  const mockCreateUserDto: CreateUserDto = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    firstname: 'Test',
    lastname: 'User',
    age: 25,
  };

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    // Mock del constructor del modelo User
    const userInstance = {
      _id: '507f1f77bcf86cd799439011',
      username: 'testuser',
      email: 'test@example.com',
      firstname: 'Test',
      lastname: 'User',
      age: 25,
      role: 'user',
      save: sinon.stub().resolves(mockUser),
      toObject: () => ({
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        age: 25,
        role: 'user',
      }),
    };

    const mockUserModel: any = sinon.stub().callsFake(() => userInstance);

    // Agregamos métodos estáticos al constructor mock
    mockUserModel.findOne = sinon.stub();
    mockUserModel.findById = sinon.stub();
    mockUserModel.findByIdAndUpdate = sinon.stub();

    const mockJwtService = {
      sign: sinon.stub(),
    };

    const mockLogger = {
      debug: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
      logAuthentication: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: CustomLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    logger = module.get<CustomLoggerService>(CustomLoggerService);

    // Reset all stubs before each test
    sinon.resetHistory();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      userModel.findOne.resolves(null); // No existing user
      const hashedPassword = 'hashedPassword123';
      sinon.stub(bcrypt, 'hash').resolves(hashedPassword);

      const mockUserInstance = {
        ...mockUser,
        save: sinon.stub().resolves(mockUser),
      };
      userModel.new = sinon.stub().returns(mockUserInstance);

      const mockToken = 'jwt.token.here';
      jwtService.sign.returns(mockToken);

      // Act
      const result = await service.register(mockCreateUserDto);

      // Assert
      expect(userModel.findOne).to.have.been.calledOnce;
      expect(userModel.findOne).to.have.been.calledWith({
        $or: [
          { email: mockCreateUserDto.email },
          { username: mockCreateUserDto.username },
        ],
      });
      expect(result).to.have.property('user');
      expect(result).to.have.property('access_token', mockToken);
      expect(result.user).to.not.have.property('password');
      expect(logger.logAuthentication).to.have.been.calledWith(
        'register',
        String(mockUser._id),
        mockCreateUserDto.email,
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      // Arrange
      userModel.findOne.resolves(mockUser); // Existing user found

      // Act & Assert
      try {
        await service.register(mockCreateUserDto);
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).to.be.instanceOf(ConflictException);
        expect(error.message).to.include('already exists');
      }

      expect(logger.logAuthentication).to.have.been.calledWith(
        'failed_login',
        undefined,
        mockCreateUserDto.email,
      );
    });

    it('should hash password before saving user', async () => {
      // Arrange
      userModel.findOne.resolves(null);
      const hashedPassword = 'hashedPassword123';
      const bcryptStub = sinon.stub(bcrypt, 'hash').resolves(hashedPassword);

      const mockUserInstance = {
        ...mockUser,
        save: sinon.stub().resolves(mockUser),
      };
      userModel.new = sinon.stub().returns(mockUserInstance);
      jwtService.sign.returns('token');

      // Act
      await service.register(mockCreateUserDto);

      // Assert
      expect(bcryptStub).to.have.been.calledOnce;
      expect(bcryptStub).to.have.been.calledWith(
        mockCreateUserDto.password,
        12,
      );
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword123',
        select: sinon.stub().returnsThis(),
      };
      userModel.findOne.returns({
        select: sinon.stub().resolves(userWithPassword),
      });

      sinon.stub(bcrypt, 'compare').resolves(true);
      const mockToken = 'jwt.token.here';
      jwtService.sign.returns(mockToken);
      userModel.findByIdAndUpdate.resolves(userWithPassword);

      // Act
      const result = await service.login(mockLoginDto);

      // Assert
      expect(userModel.findOne).to.have.been.calledWith({
        email: mockLoginDto.email,
      });
      expect(result).to.have.property('user');
      expect(result).to.have.property('access_token', mockToken);
      expect(result.user).to.not.have.property('password');
      expect(logger.logAuthentication).to.have.been.calledWith(
        'login',
        mockUser._id,
        mockLoginDto.email,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Arrange
      userModel.findOne.returns({
        select: sinon.stub().resolves(null),
      });

      // Act & Assert
      try {
        await service.login(mockLoginDto);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).to.be.instanceOf(UnauthorizedException);
        expect(error.message).to.equal('Invalid credentials');
      }

      expect(logger.logAuthentication).to.have.been.calledWith(
        'failed_login',
        undefined,
        mockLoginDto.email,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Arrange
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword123',
      };
      userModel.findOne.returns({
        select: sinon.stub().resolves(userWithPassword),
      });

      sinon.stub(bcrypt, 'compare').resolves(false); // Invalid password

      // Act & Assert
      try {
        await service.login(mockLoginDto);
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error).to.be.instanceOf(UnauthorizedException);
        expect(error.message).to.equal('Invalid credentials');
      }

      expect(logger.logAuthentication).to.have.been.calledWith(
        'failed_login',
        mockUser._id,
        mockLoginDto.email,
      );
    });

    it('should generate JWT token with correct payload', async () => {
      // Arrange
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword123',
      };
      userModel.findOne.returns({
        select: sinon.stub().resolves(userWithPassword),
      });

      sinon.stub(bcrypt, 'compare').resolves(true);
      jwtService.sign.returns('token');
      userModel.findByIdAndUpdate.resolves(userWithPassword);

      // Act
      await service.login(mockLoginDto);

      // Assert
      expect(jwtService.sign).to.have.been.calledOnce;
      expect(jwtService.sign).to.have.been.calledWith({
        sub: mockUser._id,
        username: mockUser.username,
        role: mockUser.role,
      });
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      userModel.findById.returns({
        select: sinon.stub().resolves(mockUser),
      });

      // Act
      const result = await service.validateUser(userId);

      // Assert
      expect(userModel.findById).to.have.been.calledWith(userId);
      expect(result).to.deep.equal(mockUser);
      expect(logger.debug).to.have.been.calledWith(
        `Validating user: ${userId}`,
        'AuthService',
      );
      expect(logger.debug).to.have.been.calledWith(
        `User validation successful: ${userId}`,
        'AuthService',
      );
    });

    it('should return null if user not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      userModel.findById.returns({
        select: sinon.stub().resolves(null),
      });

      // Act
      const result = await service.validateUser(userId);

      // Assert
      expect(userModel.findById).to.have.been.calledWith(userId);
      expect(result).to.be.null;
      expect(logger.warn).to.have.been.calledWith(
        `User validation failed - user not found: ${userId}`,
        'AuthService',
      );
    });

    it('should exclude password from user data', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      userModel.findById.returns({
        select: sinon.stub().resolves(mockUser),
      });

      // Act
      await service.validateUser(userId);

      // Assert
      const selectCall = userModel.findById().select;
      expect(selectCall).to.have.been.calledWith('-password');
    });
  });
});
