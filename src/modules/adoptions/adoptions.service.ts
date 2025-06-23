import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Adoption, AdoptionStatus } from '../../schemas/adoption.schema';
import { Pet, PetStatus } from '../../schemas/pet.schema';
import { User, UserRole } from '../../schemas/user.schema';
import { CreateAdoptionDto, UpdateAdoptionDto } from './dto/adoption.dto';
import { PetsService } from '../pets/pets.service';

@Injectable()
export class AdoptionsService {
  private readonly logger = new Logger(AdoptionsService.name);
  constructor(
    @InjectModel(Adoption.name) private adoptionModel: Model<Adoption>,
    @InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(User.name) private userModel: Model<User>,
    private petsService: PetsService,
  ) {}

  async create(
    createAdoptionDto: CreateAdoptionDto,
    userId: string,
  ): Promise<Adoption> {
    this.logger.log(
      `User ${userId} requesting adoption for pet ${createAdoptionDto.pet}`,
    );

    if (!Types.ObjectId.isValid(createAdoptionDto.pet)) {
      throw new BadRequestException('Invalid pet ID');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    try {
      // Check if pet exists and is available
      const pet = await this.petModel.findById(createAdoptionDto.pet);
      if (!pet) {
        throw new NotFoundException('Pet not found');
      }

      if (pet.status !== PetStatus.AVAILABLE) {
        throw new ConflictException('Pet is not available for adoption');
      }

      // Check if user already has a pending adoption for this pet
      const existingAdoption = await this.adoptionModel.findOne({
        user: userId,
        pet: createAdoptionDto.pet,
        status: AdoptionStatus.PENDING,
      });

      if (existingAdoption) {
        throw new ConflictException(
          'You already have a pending adoption request for this pet',
        );
      }

      const adoption = new this.adoptionModel({
        ...createAdoptionDto,
        user: userId,
        status: AdoptionStatus.PENDING,
      });

      const savedAdoption = await adoption.save();
      await savedAdoption.populate([
        { path: 'user', select: 'username firstname lastname email' },
        { path: 'pet', select: 'name breed age status' },
      ]);

      this.logger.log(`Adoption request created with ID: ${savedAdoption._id}`);
      return savedAdoption;
    } catch (error) {
      this.logger.error(
        `Error creating adoption request: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: AdoptionStatus,
    userId?: string,
  ): Promise<{
    adoptions: Adoption[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (userId && Types.ObjectId.isValid(userId)) {
      query.user = userId;
    }

    const skip = (page - 1) * limit;

    const [adoptions, total] = await Promise.all([
      this.adoptionModel
        .find(query)
        .populate('user', 'username firstname lastname email')
        .populate('pet', 'name breed age status image')
        .populate('adminApprover', 'username firstname lastname')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.adoptionModel.countDocuments(query),
    ]);

    return {
      adoptions,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Adoption> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid adoption ID');
    }

    const adoption = await this.adoptionModel
      .findById(id)
      .populate('user', 'username firstname lastname email age')
      .populate('pet', 'name breed age status image description')
      .populate('adminApprover', 'username firstname lastname')
      .exec();

    if (!adoption) {
      throw new NotFoundException('Adoption request not found');
    }

    return adoption;
  }

  async updateStatus(
    id: string,
    updateAdoptionDto: UpdateAdoptionDto,
    adminId: string,
  ): Promise<Adoption> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid adoption ID');
    }

    if (!Types.ObjectId.isValid(adminId)) {
      throw new BadRequestException('Invalid admin ID');
    }

    const adoption = await this.adoptionModel.findById(id);
    if (!adoption) {
      throw new NotFoundException('Adoption request not found');
    }

    // Only allow status updates on pending adoptions
    if (adoption.status !== AdoptionStatus.PENDING) {
      throw new ConflictException(
        'Can only update status of pending adoption requests',
      );
    }

    const pet = await this.petModel.findById(adoption.pet);
    if (!pet) {
      throw new NotFoundException('Associated pet not found');
    }

    // Update adoption
    adoption.status = updateAdoptionDto.status;
    adoption.adminApprover = new Types.ObjectId(adminId);
    if (updateAdoptionDto.notes) {
      adoption.notes = updateAdoptionDto.notes;
    }

    if (updateAdoptionDto.status === AdoptionStatus.APPROVED) {
      adoption.approvedDate = new Date();

      // Use PetsService to mark pet as adopted
      await this.petsService.markAsAdopted(
        adoption.pet.toString(),
        adoption.user.toString(),
      );

      // Reject all other pending adoption requests for this pet
      await this.adoptionModel.updateMany(
        {
          pet: adoption.pet,
          _id: { $ne: adoption._id },
          status: AdoptionStatus.PENDING,
        },
        {
          status: AdoptionStatus.REJECTED,
          adminApprover: adminId,
          rejectedDate: new Date(),
          notes: 'Pet was adopted by another user',
        },
      );

      this.logger.log(
        `Adoption approved: Pet ${pet._id} adopted by user ${adoption.user}`,
      );
    } else if (updateAdoptionDto.status === AdoptionStatus.REJECTED) {
      adoption.rejectedDate = new Date();
      this.logger.log(`Adoption request rejected: ${adoption._id}`);
    }

    await adoption.save();
    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid adoption ID');
    }

    const adoption = await this.adoptionModel.findById(id);
    if (!adoption) {
      throw new NotFoundException('Adoption request not found');
    }

    // Users can only delete their own pending adoption requests
    // Admins can delete any adoption request
    if (userRole !== UserRole.ADMIN && adoption.user.toString() !== userId) {
      throw new ForbiddenException(
        'You can only delete your own adoption requests',
      );
    }

    // Only allow deletion of pending adoptions
    if (adoption.status !== AdoptionStatus.PENDING) {
      throw new ConflictException('Can only delete pending adoption requests');
    }

    await this.adoptionModel.findByIdAndDelete(id);
    this.logger.log(`Adoption request deleted: ${id}`);
  }

  async getUserAdoptions(userId: string): Promise<Adoption[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    return this.adoptionModel
      .find({ user: userId })
      .populate('pet', 'name breed age status image')
      .populate('adminApprover', 'username firstname lastname')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPendingAdoptions(): Promise<Adoption[]> {
    return this.adoptionModel
      .find({ status: AdoptionStatus.PENDING })
      .populate('user', 'username firstname lastname email')
      .populate('pet', 'name breed age status image')
      .sort({ createdAt: 1 }) // Oldest first
      .exec();
  }

  async getAdoptionStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const [total, pending, approved, rejected] = await Promise.all([
      this.adoptionModel.countDocuments(),
      this.adoptionModel.countDocuments({ status: AdoptionStatus.PENDING }),
      this.adoptionModel.countDocuments({ status: AdoptionStatus.APPROVED }),
      this.adoptionModel.countDocuments({ status: AdoptionStatus.REJECTED }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
    };
  }
}
