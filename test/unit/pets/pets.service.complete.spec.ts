/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as sinon from 'sinon';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { PetsService } from '../../../src/modules/pets/pets.service';
import { Pet, PetStatus } from '../../../src/schemas/pet.schema';
import { User } from '../../../src/schemas/user.schema';
import { CustomLoggerService } from '../../../src/common/services/custom-logger.service';
import { CreatePetDto } from '../../../src/modules/pets/dto/create-pet.dto';
import { UpdatePetDto } from '../../../src/modules/pets/dto/update-pet.dto';

describe('PetsService - Complete Unit Tests', () => {
  let service: PetsService;
  let petModel: any;
  let userModel: any;
  let logger: any;

  beforeEach(async () => {
    // Mock pet model with all methods
    petModel = {
      find: sinon.stub(),
      findById: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
      findByIdAndDelete: sinon.stub(),
      countDocuments: sinon.stub(),
      insertMany: sinon.stub(),
      save: sinon.stub(),
      create: sinon.stub(),
      updateMany: sinon.stub(),
      deleteMany: sinon.stub(),
    };

    // Mock user model
    userModel = {
      findById: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
    };

    // Mock logger
    logger = {
      info: sinon.stub(),
      error: sinon.stub(),
      warn: sinon.stub(),
      debug: sinon.stub(),
      log: sinon.stub(),
      logDatabaseOperation: sinon.stub(),
      logBusinessEvent: sinon.stub(),
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
      const createPetDto: CreatePetDto = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
        description: 'Friendly dog',
      };

      const mockSavedPet = {
        _id: new Types.ObjectId(),
        ...createPetDto,
        status: PetStatus.AVAILABLE,
        save: sinon.stub().resolves({
          _id: new Types.ObjectId(),
          ...createPetDto,
        }),
      };

      // Mock constructor behavior
      const PetConstructor = sinon.stub().returns(mockSavedPet);
      (service as any).petModel = PetConstructor;

      const result = await service.create(createPetDto);

      expect(result).to.have.property('_id');
      expect(result.name).to.equal('Buddy');
      expect(logger.logDatabaseOperation.calledOnce).to.be.true;
    });

    it('should handle creation errors', async () => {
      const createPetDto: CreatePetDto = {
        name: 'Buddy',
        breed: 'Golden Retriever',
        age: 3,
      };

      const mockPet = {
        save: sinon.stub().rejects(new Error('Database error')),
      };

      const PetConstructor = sinon.stub().returns(mockPet);
      (service as any).petModel = PetConstructor;

      try {
        await service.create(createPetDto);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('Database error');
        expect(logger.error.calledOnce).to.be.true;
      }
    });
  });

  describe('findAll', () => {
    it('should return paginated pets with filters', async () => {
      const mockPets = [
        {
          _id: new Types.ObjectId(),
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

      const result = await service.findAll(
        1,
        10,
        PetStatus.AVAILABLE,
        'Golden',
      );

      expect(result).to.have.property('data');
      expect(result).to.have.property('pagination');
      expect(result.data).to.be.an('array');
      expect(result.pagination.total).to.equal(1);
      expect(
        petModel.find.calledWith({
          status: PetStatus.AVAILABLE,
          breed: { $regex: 'Golden', $options: 'i' },
        }),
      ).to.be.true;
    });

    it('should handle empty results', async () => {
      const query = {
        populate: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves([]),
      };

      petModel.find.returns(query);
      petModel.countDocuments.resolves(0);

      const result = await service.findAll();

      expect(result.data).to.be.an('array').that.is.empty;
      expect(result.pagination.total).to.equal(0);
    });
  });

  describe('findOne', () => {
    it('should return a pet by id', async () => {
      const petId = new Types.ObjectId().toString();
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

      const result = await service.findOne(petId);

      expect(result).to.deep.equal(mockPet);
      expect(petModel.findById.calledWith(petId)).to.be.true;
    });

    it('should throw NotFoundException when pet not found', async () => {
      const petId = new Types.ObjectId().toString();
      const query = {
        populate: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(null),
      };
      petModel.findById.returns(query);

      try {
        await service.findOne(petId);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
        expect(error.message).to.equal('Pet not found');
      }
    });

    it('should throw NotFoundException for invalid ObjectId', async () => {
      const invalidId = 'invalid-id';

      try {
        await service.findOne(invalidId);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
        expect(error.message).to.equal('Invalid pet ID');
      }
    });
  });

  describe('update', () => {
    it('should update a pet successfully', async () => {
      const petId = new Types.ObjectId().toString();
      const updateDto: UpdatePetDto = {
        name: 'Updated Buddy',
        age: 4,
      };

      const updatedPet = {
        _id: petId,
        ...updateDto,
        breed: 'Golden Retriever',
      };

      const query = {
        populate: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(updatedPet),
      };
      petModel.findByIdAndUpdate.returns(query);

      const result = await service.update(petId, updateDto);

      expect(result).to.deep.equal(updatedPet);
      expect(
        petModel.findByIdAndUpdate.calledWith(petId, updateDto, { new: true }),
      ).to.be.true;
      expect(logger.log.calledOnce).to.be.true;
    });

    it('should throw NotFoundException when pet not found for update', async () => {
      const petId = new Types.ObjectId().toString();
      const updateDto: UpdatePetDto = { name: 'Updated' };

      const query = {
        populate: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(null),
      };
      petModel.findByIdAndUpdate.returns(query);

      try {
        await service.update(petId, updateDto);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });
  });

  describe('remove', () => {
    it('should delete available pet successfully', async () => {
      const petId = new Types.ObjectId().toString();
      const mockPet = {
        _id: petId,
        status: PetStatus.AVAILABLE,
      };

      petModel.findById.resolves(mockPet);
      petModel.findByIdAndDelete.resolves(mockPet);

      const result = await service.remove(petId);

      expect(result).to.have.property('message');
      expect(result.message).to.include('deleted successfully');
      expect(logger.log.calledOnce).to.be.true;
    });

    it('should throw ConflictException for adopted pet', async () => {
      const petId = new Types.ObjectId().toString();
      const mockPet = {
        _id: petId,
        status: PetStatus.ADOPTED,
      };

      petModel.findById.resolves(mockPet);

      try {
        await service.remove(petId);
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).to.be.instanceOf(ConflictException);
        expect(error.message).to.equal('Cannot delete an adopted pet');
      }
    });

    it('should throw NotFoundException when pet not found for deletion', async () => {
      const petId = new Types.ObjectId().toString();
      petModel.findById.resolves(null);

      try {
        await service.remove(petId);
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });
  });

  describe('likePet', () => {
    it('should like a pet successfully', async () => {
      const petId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId().toString();
      const mockPet = {
        _id: petId,
        name: 'Buddy',
        likedBy: [],
        save: sinon.stub().resolves(),
      };

      petModel.findById.resolves(mockPet);

      // Mock findOne for return value
      const findOneStub = sinon
        .stub(service, 'findOne')
        .resolves(mockPet as any);

      const result = await service.likePet(petId, userId);

      expect(mockPet.likedBy).to.have.length(1);
      expect(findOneStub.calledOnce).to.be.true;

      findOneStub.restore();
    });

    it('should throw ConflictException if pet already liked', async () => {
      const petId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId();
      const mockPet = {
        _id: petId,
        likedBy: {
          includes: sinon.stub().returns(true), // Simular que ya está liked
        },
        save: sinon.stub().resolves(),
      };

      petModel.findById.resolves(mockPet);

      try {
        await service.likePet(petId, userId.toString());
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).to.be.instanceOf(ConflictException);
        expect(error.message).to.equal('Pet already liked by user');
      }
    });
  });

  describe('unlikePet', () => {
    it('should unlike a pet successfully', async () => {
      const petId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId();
      const userIdStr = userId.toString();

      const mockPet = {
        _id: petId,
        likedBy: [userId], // Array con ObjectId
        save: sinon.stub().resolves(),
      };

      // Mock para que includes() funcione correctamente con ObjectIds
      mockPet.likedBy.includes = sinon.stub().returns(true);
      mockPet.likedBy.filter = sinon.stub().returns([]);

      petModel.findById.resolves(mockPet);

      const findOneStub = sinon
        .stub(service, 'findOne')
        .resolves(mockPet as any);

      await service.unlikePet(petId, userIdStr);

      expect(findOneStub.calledOnce).to.be.true;

      findOneStub.restore();
    });

    it('should throw ConflictException if pet not liked', async () => {
      const petId = new Types.ObjectId().toString();
      const userId = new Types.ObjectId();
      const mockPet = {
        _id: petId,
        likedBy: [],
      };

      petModel.findById.resolves(mockPet);

      try {
        await service.unlikePet(petId, userId.toString());
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).to.be.instanceOf(ConflictException);
        expect(error.message).to.equal('Pet not liked by user');
      }
    });
  });

  describe('getUserPets', () => {
    it('should return user owned pets', async () => {
      const userId = new Types.ObjectId().toString();
      const mockPets = [
        { _id: new Types.ObjectId(), name: 'Pet1', owner: userId },
        { _id: new Types.ObjectId(), name: 'Pet2', owner: userId },
      ];

      const query = {
        sort: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockPets),
      };
      petModel.find.returns(query);

      const result = await service.getUserPets(userId);

      expect(result).to.be.an('array').with.length(2);
      expect(petModel.find.calledWith({ owner: userId })).to.be.true;
    });
  });

  describe('getUserLikedPets', () => {
    it('should return user liked pets', async () => {
      const userId = new Types.ObjectId().toString();
      const mockPets = [
        { _id: new Types.ObjectId(), name: 'Pet1', likedBy: [userId] },
      ];

      const query = {
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockPets),
      };
      petModel.find.returns(query);

      const result = await service.getUserLikedPets(userId);

      expect(result).to.be.an('array').with.length(1);
      expect(petModel.find.calledWith({ likedBy: userId })).to.be.true;
    });
  });

  describe('markAsAdopted', () => {
    it('should mark pet as adopted successfully', async () => {
      const petId = new Types.ObjectId().toString();
      const ownerId = new Types.ObjectId().toString();
      const mockPet = {
        _id: petId,
        status: PetStatus.AVAILABLE,
        owner: null,
        save: sinon.stub().resolves(),
      };

      petModel.findById.resolves(mockPet);

      const findOneStub = sinon
        .stub(service, 'findOne')
        .resolves(mockPet as any);

      const result = await service.markAsAdopted(petId, ownerId);

      expect(mockPet.status).to.equal(PetStatus.ADOPTED);
      expect(mockPet.owner).to.be.instanceOf(Types.ObjectId);
      expect(logger.log.calledOnce).to.be.true;

      findOneStub.restore();
    });

    it('should throw ConflictException for unavailable pet', async () => {
      const petId = new Types.ObjectId().toString();
      const ownerId = new Types.ObjectId().toString();
      const mockPet = {
        _id: petId,
        status: PetStatus.ADOPTED,
      };

      petModel.findById.resolves(mockPet);

      try {
        await service.markAsAdopted(petId, ownerId);
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).to.be.instanceOf(ConflictException);
        expect(error.message).to.equal('Pet is not available for adoption');
      }
    });
  });
});
