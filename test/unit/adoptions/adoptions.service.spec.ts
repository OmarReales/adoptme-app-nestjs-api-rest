/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as sinon from 'sinon';

import { AdoptionsService } from '../../../src/modules/adoptions/adoptions.service';
import { PetsService } from '../../../src/modules/pets/pets.service';
import { NotificationsService } from '../../../src/modules/notifications/notifications.service';
import { Adoption, AdoptionStatus } from '../../../src/schemas/adoption.schema';
import { Pet, PetStatus } from '../../../src/schemas/pet.schema';
import { User, UserRole } from '../../../src/schemas/user.schema';
import { UpdateAdoptionDto } from '../../../src/modules/adoptions/dto/adoption.dto';

describe('AdoptionsService', () => {
  let service: AdoptionsService;
  let adoptionModel: any;
  let petModel: any;
  let userModel: any;
  let petsService: any;
  let notificationsService: any;

  const mockObjectId = new Types.ObjectId('507f1f77bcf86cd799439011');
  const mockPetId = new Types.ObjectId('507f1f77bcf86cd799439012');
  const mockUserId = new Types.ObjectId('507f1f77bcf86cd799439013');
  const mockAdminId = new Types.ObjectId('507f1f77bcf86cd799439014');

  const mockPet = {
    _id: mockPetId,
    name: 'Buddy',
    breed: 'Golden Retriever',
    age: 3,
    status: PetStatus.AVAILABLE,
    description: 'Friendly dog',
  };

  const mockAdoption = {
    _id: mockObjectId,
    user: mockUserId,
    pet: mockPetId,
    status: AdoptionStatus.PENDING,
    notes: 'I would love to adopt this pet',
    createdAt: new Date(),
    save: sinon.stub().resolves(),
    populate: sinon.stub().returnsThis(),
  };

  beforeEach(async () => {
    adoptionModel = {
      findOne: sinon.stub(),
      findById: sinon.stub(),
      find: sinon.stub(),
      countDocuments: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
      findByIdAndDelete: sinon.stub(),
      updateMany: sinon.stub(),
    };

    petModel = {
      findById: sinon.stub(),
      findByIdAndUpdate: sinon.stub(),
    };

    userModel = {
      findById: sinon.stub(),
      find: sinon.stub(),
    };

    petsService = {
      findOne: sinon.stub(),
      markAsAdopted: sinon.stub(),
    };

    notificationsService = {
      create: sinon.stub(),
      sendNotification: sinon.stub(),
      notifyAdoptionRequest: sinon.stub(),
      notifyAdoptionApproved: sinon.stub(),
      notifyAdoptionRejected: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdoptionsService,
        {
          provide: getModelToken(Adoption.name),
          useValue: adoptionModel,
        },
        {
          provide: getModelToken(Pet.name),
          useValue: petModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: PetsService,
          useValue: petsService,
        },
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    service = module.get<AdoptionsService>(AdoptionsService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('findAll', () => {
    const mockAdoptions = [mockAdoption];

    beforeEach(() => {
      adoptionModel.find.returns({
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockAdoptions),
      });
      adoptionModel.countDocuments.resolves(1);
    });

    it('should return paginated adoptions', async () => {
      const result = await service.findAll(1, 10);

      expect(result).to.have.property('adoptions');
      expect(result).to.have.property('total');
      expect(result).to.have.property('page');
      expect(result).to.have.property('limit');
      expect(result.adoptions).to.deep.equal(mockAdoptions);
      expect(result.total).to.equal(1);
      expect(result.page).to.equal(1);
      expect(result.limit).to.equal(10);
    });
  });

  describe('findOne', () => {
    beforeEach(() => {
      adoptionModel.findById.returns({
        populate: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockAdoption),
      });
    });

    it('should find adoption by ID', async () => {
      const result = await service.findOne(mockObjectId.toString());
      expect(result).to.deep.equal(mockAdoption);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      try {
        await service.findOne('invalid-id');
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException if adoption not found', async () => {
      adoptionModel.findById.returns({
        populate: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(null),
      });

      try {
        await service.findOne(mockObjectId.toString());
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });
  });

  describe('updateStatus', () => {
    const mockUpdateDto: UpdateAdoptionDto = {
      status: AdoptionStatus.APPROVED,
      notes: 'Updated notes',
    };

    beforeEach(() => {
      const mockAdoptionInstance = {
        ...mockAdoption,
        save: sinon.stub().resolves(mockAdoption),
        status: AdoptionStatus.PENDING,
        adminApprover: undefined,
        notes: undefined,
      };

      adoptionModel.findById.resolves(mockAdoptionInstance);
      petModel.findById.resolves(mockPet);
      adoptionModel.updateMany.resolves({ modifiedCount: 0 });
      petsService.markAsAdopted.resolves();

      // Mock para buscar administradores en notificaciones
      userModel.find.returns({
        select: sinon.stub().resolves([{ _id: mockAdminId }]),
      });

      // Mock para buscar otras adopciones pendientes
      adoptionModel.find.returns({
        select: sinon.stub().resolves([]),
      });

      sinon.stub(service, 'findOne').resolves({
        ...mockAdoption,
        status: AdoptionStatus.APPROVED,
      } as any);
    });

    it('should update adoption status successfully', async () => {
      const result = await service.updateStatus(
        mockObjectId.toString(),
        mockUpdateDto,
        mockAdminId.toString(),
      );

      expect(result).to.be.an('object');
      expect(result.status).to.equal(AdoptionStatus.APPROVED);
    });

    it('should throw NotFoundException for invalid ID', async () => {
      try {
        await service.updateStatus(
          'invalid-id',
          mockUpdateDto,
          mockAdminId.toString(),
        );
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });

    it('should throw NotFoundException if adoption not found', async () => {
      adoptionModel.findById.resolves(null);

      try {
        await service.updateStatus(
          mockObjectId.toString(),
          mockUpdateDto,
          mockAdminId.toString(),
        );
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      adoptionModel.findById.resolves(mockAdoption);
      adoptionModel.findByIdAndDelete.resolves();
    });

    it('should remove adoption successfully as admin', async () => {
      await service.remove(
        mockObjectId.toString(),
        mockAdminId.toString(),
        UserRole.ADMIN,
      );
      // Test passes if no exception is thrown
    });

    it('should remove adoption successfully as owner', async () => {
      await service.remove(
        mockObjectId.toString(),
        mockUserId.toString(),
        UserRole.USER,
      );
      // Test passes if no exception is thrown
    });

    it('should throw NotFoundException for invalid ID', async () => {
      try {
        await service.remove(
          'invalid-id',
          mockUserId.toString(),
          UserRole.USER,
        );
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });

    it('should throw ForbiddenException if user is not owner and not admin', async () => {
      const otherUserId = new Types.ObjectId(
        '507f1f77bcf86cd799439099',
      ).toString();

      try {
        await service.remove(
          mockObjectId.toString(),
          otherUserId,
          UserRole.USER,
        );
        expect.fail('Should have thrown ForbiddenException');
      } catch (error) {
        expect(error).to.be.instanceOf(ForbiddenException);
      }
    });
  });

  describe('getUserAdoptions', () => {
    const mockAdoptions = [mockAdoption];

    beforeEach(() => {
      adoptionModel.find.returns({
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockAdoptions),
      });
    });

    it('should get user adoptions successfully', async () => {
      const result = await service.getUserAdoptions(mockUserId.toString());
      expect(result).to.deep.equal(mockAdoptions);
    });

    it('should throw NotFoundException for invalid user ID', async () => {
      try {
        await service.getUserAdoptions('invalid-id');
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).to.be.instanceOf(NotFoundException);
      }
    });
  });

  describe('getPendingAdoptions', () => {
    const mockAdoptions = [mockAdoption];

    beforeEach(() => {
      adoptionModel.find.returns({
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(mockAdoptions),
      });
    });

    it('should get pending adoptions successfully', async () => {
      const result = await service.getPendingAdoptions();
      expect(result).to.deep.equal(mockAdoptions);
    });
  });

  describe('getAdoptionStats', () => {
    beforeEach(() => {
      adoptionModel.countDocuments.onCall(0).resolves(10); // total
      adoptionModel.countDocuments.onCall(1).resolves(3); // pending
      adoptionModel.countDocuments.onCall(2).resolves(5); // approved
      adoptionModel.countDocuments.onCall(3).resolves(2); // rejected
    });

    it('should get adoption stats successfully', async () => {
      const result = await service.getAdoptionStats();

      expect(result).to.deep.equal({
        total: 10,
        pending: 3,
        approved: 5,
        rejected: 2,
      });
    });
  });
});
