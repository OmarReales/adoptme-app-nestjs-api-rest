/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as sinon from 'sinon';
import { PetsService } from '../../../src/modules/pets/pets.service';
import { Pet, PetStatus } from '../../../src/schemas/pet.schema';
import { User } from '../../../src/schemas/user.schema';
import { CustomLoggerService } from '../../../src/common/services/custom-logger.service';
import { CreatePetDto } from '../../../src/modules/pets/dto/create-pet.dto';
import { NotFoundException } from '@nestjs/common';

describe('PetsService - Unit Tests', () => {
  let service: PetsService;
  let petModel: any;
  let userModel: any;
  let logger: any;

  beforeEach(async () => {
    petModel = {
      find: sinon.stub(),
      findById: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
      findByIdAndDelete: sinon.stub(),
      countDocuments: sinon.stub(),
      create: sinon.stub(),
      save: sinon.stub(),
    };

    userModel = {
      findById: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
    };

    logger = {
      info: sinon.stub(),
      error: sinon.stub(),
      warn: sinon.stub(),
      debug: sinon.stub(),
      logDatabaseOperation: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        {
          provide: getModelToken(Pet.name),
          useValue: petModel,
        },
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

    service = module.get<PetsService>(PetsService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('create', () => {
    it('should create a new pet successfully', async () => {
      // Arrange
      const createPetDto: CreatePetDto = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        description: 'Friendly dog',
        status: PetStatus.AVAILABLE,
      };

      const mockPet = {
        _id: '507f1f77bcf86cd799439011',
        ...createPetDto,
        save: sinon.stub().resolves({
          _id: '507f1f77bcf86cd799439011',
          ...createPetDto,
        }),
      };

      // Mock the model constructor
      const PetConstructor = sinon.stub().returns(mockPet);
      (service as any).petModel = PetConstructor;

      // Act
      const result = await service.create(createPetDto);

      // Assert
      expect(result).to.have.property('_id');
      expect(result.name).to.equal('Buddy');
    });
  });

  describe('findAll', () => {
    it('should return paginated list of pets', async () => {
      // Arrange
      const mockPets = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Buddy',
          breed: 'Golden Retriever',
          age: 3,
          status: PetStatus.AVAILABLE,
        },
      ];

      const query = {
        populate: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockPets),
      };

      petModel.find.returns(query);
      petModel.countDocuments.resolves(1);

      // Act
      const result = await service.findAll(1, 10);

      // Assert
      expect(result).to.have.property('data');
      expect(result).to.have.property('pagination');
      expect(result.data).to.be.an('array');
      expect(result.pagination.total).to.equal(1);
    });
  });

  describe('findOne', () => {
    it('should return a pet by id', async () => {
      // Arrange
      const petId = '507f1f77bcf86cd799439011';
      const mockPet = {
        _id: petId,
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
      };

      const query = {
        populate: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockPet),
      };
      petModel.findById.returns(query);

      // Act
      const result = await service.findOne(petId);

      // Assert
      expect(result).to.deep.equal(mockPet);
    });

    it('should throw NotFoundException when pet is not found', async () => {
      // Arrange
      const petId = '507f1f77bcf86cd799439011';
      const query = {
        populate: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(null),
      };
      petModel.findById.returns(query);

      // Act & Assert
      try {
        await service.findOne(petId);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });
  });
});
