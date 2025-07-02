/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import * as sinon from 'sinon';
import * as bcrypt from 'bcryptjs';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { UsersService } from '../../../src/modules/users/users.service';
import { User, UserRole } from '../../../src/schemas/user.schema';
import { CustomLoggerService } from '../../../src/common/services/custom-logger.service';
import { CreateUserDto } from '../../../src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../src/modules/users/dto/update-user.dto';

describe('UsersService - Unit Tests', () => {
  let service: UsersService;
  let userModel: any;
  let logger: any;
  let bcryptHashStub: sinon.SinonStub;

  beforeEach(async () => {
    // Mock del constructor del modelo User
    userModel = sinon.stub().callsFake(() => ({
      save: sinon.stub().resolves({
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      }),
    }));

    // Agregamos métodos estáticos al constructor mock
    userModel.findOne = sinon.stub();
    userModel.findById = sinon.stub();
    userModel.findByIdAndUpdate = sinon.stub();
    userModel.findByIdAndDelete = sinon.stub();
    userModel.find = sinon.stub();
    userModel.countDocuments = sinon.stub();

    logger = {
      info: sinon.stub(),
      error: sinon.stub(),
      warn: sinon.stub(),
      debug: sinon.stub(),
      logDatabaseOperation: sinon.stub(),
    };

    bcryptHashStub = sinon.stub(bcrypt, 'hash');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: CustomLoggerService,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        age: 25,
        role: UserRole.USER,
      };

      const hashedPassword = 'hashedPassword123';

      userModel.findOne.resolves(null);
      bcryptHashStub.resolves(hashedPassword);

      const result = await service.create(createUserDto);

      expect(result).to.have.property('_id');
      expect(userModel.findOne.calledOnce).to.be.true;
      expect(bcryptHashStub.calledWith('Password123!', 12)).to.be.true;
      expect(logger.logDatabaseOperation.calledOnce).to.be.true;
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        age: 25,
        role: UserRole.USER,
      };

      const existingUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
      };
      userModel.findOne.resolves(existingUser);

      try {
        await service.create(createUserDto);
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).to.be.instanceOf(ConflictException);
        expect(error.message).to.equal(
          'User with this email or userName already exists',
        );
        expect(logger.warn.calledOnce).to.be.true;
      }
    });

    it('should handle creation errors', async () => {
      const createUserDto: CreateUserDto = {
        userName: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        age: 25,
        role: UserRole.USER,
      };

      userModel.findOne.resolves(null);
      bcryptHashStub.resolves('hashedPassword');

      // Hacer que el constructor mock devuelva un objeto con save que falla
      userModel.callsFake(() => ({
        save: sinon.stub().rejects(new Error('Database error')),
      }));

      try {
        await service.create(createUserDto);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Database error');
        expect(logger.error.calledOnce).to.be.true;
      }
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        {
          _id: new Types.ObjectId(),
          userName: 'user1',
          email: 'user1@example.com',
          role: UserRole.USER,
        },
        {
          _id: new Types.ObjectId(),
          userName: 'user2',
          email: 'user2@example.com',
          role: UserRole.ADMIN,
        },
      ];

      const query = {
        select: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockUsers),
      };

      userModel.find.returns(query);
      userModel.countDocuments.returns({ exec: sinon.stub().resolves(2) });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).to.have.property('data');
      expect(result).to.have.property('pagination');
      expect(result.data).to.be.an('array').with.length(2);
      expect(result.pagination.total).to.equal(2);
      expect(result.pagination.page).to.equal(1);
      expect(result.pagination.limit).to.equal(10);
    });

    it('should filter users by role', async () => {
      const mockAdmins = [
        {
          _id: new Types.ObjectId(),
          userName: 'admin1',
          email: 'admin1@example.com',
          role: UserRole.ADMIN,
        },
      ];

      const query = {
        select: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockAdmins),
      };

      userModel.find.returns(query);
      userModel.countDocuments.returns({ exec: sinon.stub().resolves(1) });

      const result = await service.findAll({ role: UserRole.ADMIN });

      expect(result.data).to.have.length(1);
      expect(userModel.find.calledWith({ role: UserRole.ADMIN })).to.be.true;
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        userName: 'testuser',
        email: 'test@example.com',
      };

      const query = {
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockUser),
      };
      userModel.findById.returns(query);

      const result = await service.findOne(userId);

      expect(result).to.deep.equal(mockUser);
      expect(userModel.findById.calledWith(userId)).to.be.true;
      expect(logger.debug.calledTwice).to.be.true;
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = new Types.ObjectId().toString();
      const query = {
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(null),
      };
      userModel.findById.returns(query);

      try {
        await service.findOne(userId);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
        expect(error.message).to.equal('User not found');
        expect(logger.warn.calledOnce).to.be.true;
      }
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';
      const mockUser = { _id: new Types.ObjectId(), email };

      const query = {
        exec: sinon.stub().resolves(mockUser),
      };
      userModel.findOne.returns(query);

      const result = await service.findByEmail(email);

      expect(result).to.deep.equal(mockUser);
      expect(userModel.findOne.calledWith({ email })).to.be.true;
    });

    it('should return null if user not found', async () => {
      const email = 'notfound@example.com';

      const query = {
        exec: sinon.stub().resolves(null),
      };
      userModel.findOne.returns(query);

      const result = await service.findByEmail(email);

      expect(result).to.be.null;
    });
  });

  describe('findByUserName', () => {
    it('should return user by userName', async () => {
      const userName = 'testuser';
      const mockUser = { _id: new Types.ObjectId(), userName };

      const query = {
        exec: sinon.stub().resolves(mockUser),
      };
      userModel.findOne.returns(query);

      const result = await service.findByUserName(userName);

      expect(result).to.deep.equal(mockUser);
      expect(userModel.findOne.calledWith({ userName })).to.be.true;
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = new Types.ObjectId().toString();
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
        age: 30,
      };

      const updatedUser = {
        _id: userId,
        userName: 'testuser',
        ...updateDto,
      };

      userModel.findOne.resolves(null); // No existing user with same email/userName

      const query = {
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(updatedUser),
      };
      userModel.findByIdAndUpdate.returns(query);

      const result = await service.update(userId, updateDto);

      expect(result).to.deep.equal(updatedUser);
      expect(logger.logDatabaseOperation.calledOnce).to.be.true;
    });

    it('should hash password when updating', async () => {
      const userId = new Types.ObjectId().toString();
      const updateDto: UpdateUserDto = {
        password: 'NewPassword123!',
      };

      const hashedPassword = 'newHashedPassword';
      bcryptHashStub.resolves(hashedPassword);

      userModel.findOne.resolves(null);

      const query = {
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves({ _id: userId }),
      };
      userModel.findByIdAndUpdate.returns(query);

      await service.update(userId, updateDto);

      expect(bcryptHashStub.calledWith('NewPassword123!', 12)).to.be.true;
      expect(
        userModel.findByIdAndUpdate.calledWith(
          userId,
          sinon.match({ password: hashedPassword }),
          { new: true },
        ),
      ).to.be.true;
    });

    it('should throw ConflictException for duplicate email/userName', async () => {
      const userId = new Types.ObjectId().toString();
      const updateDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const existingUser = {
        _id: new Types.ObjectId(),
        email: 'existing@example.com',
      };
      userModel.findOne.resolves(existingUser);

      try {
        await service.update(userId, updateDto);
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).to.be.instanceOf(ConflictException);
        expect(error.message).to.equal(
          'User with this email or userName already exists',
        );
      }
    });

    it('should throw NotFoundException when user not found for update', async () => {
      const userId = new Types.ObjectId().toString();
      const updateDto: UpdateUserDto = { firstName: 'Updated' };

      userModel.findOne.resolves(null);

      const query = {
        select: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(null),
      };
      userModel.findByIdAndUpdate.returns(query);

      try {
        await service.update(userId, updateDto);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
        expect(error.message).to.equal('User not found');
      }
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      const userId = new Types.ObjectId().toString();
      const deletedUser = { _id: userId, userName: 'testuser' };

      const query = {
        exec: sinon.stub().resolves(deletedUser),
      };
      userModel.findByIdAndDelete.returns(query);

      await service.remove(userId);

      expect(userModel.findByIdAndDelete.calledWith(userId)).to.be.true;
      expect(logger.logDatabaseOperation.calledOnce).to.be.true;
    });

    it('should throw NotFoundException when user not found for removal', async () => {
      const userId = new Types.ObjectId().toString();

      const query = {
        exec: sinon.stub().resolves(null),
      };
      userModel.findByIdAndDelete.returns(query);

      try {
        await service.remove(userId);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
        expect(error.message).to.equal('User not found');
        expect(logger.warn.calledOnce).to.be.true;
      }
    });
  });
});
