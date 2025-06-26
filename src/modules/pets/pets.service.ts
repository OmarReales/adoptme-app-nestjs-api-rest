import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pet, PetStatus } from '../../schemas/pet.schema';
import { User } from '../../schemas/user.schema';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CustomLoggerService } from '../../common/services/custom-logger.service';
import { ErrorHandlerUtil } from '../../common/utils/error-handler.util';

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly logger: CustomLoggerService,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    this.logger.info(
      `Creating new pet with name: ${createPetDto.name}`,
      'PetsService',
    );

    try {
      const pet = new this.petModel(createPetDto);
      const savedPet = await pet.save();
      const petId = String(savedPet._id);

      this.logger.logDatabaseOperation(
        'create',
        'Pet',
        `Pet created successfully with ID: ${petId}`,
        'PetsService',
      );

      return savedPet;
    } catch (error: unknown) {
      ErrorHandlerUtil.handleDatabaseError(
        error,
        'create',
        'Pet',
        'PetsService',
        this.logger,
      );
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: PetStatus,
    breed?: string,
    species?: string,
    name?: string,
    ageRange?: string,
  ): Promise<{
    data: Pet[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const query: Record<string, any> = {};

    if (status) {
      query.status = status;
    }

    if (breed) {
      query.breed = { $regex: breed, $options: 'i' };
    }

    if (species) {
      query.species = species;
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (ageRange) {
      switch (ageRange) {
        case 'young':
          query.age = { $gte: 1, $lte: 3 };
          break;
        case 'adult':
          query.age = { $gte: 4, $lte: 8 };
          break;
        case 'senior':
          query.age = { $gte: 9 };
          break;
      }
    }

    const skip = (page - 1) * limit;

    const [pets, total] = await Promise.all([
      this.petModel
        .find(query)
        .populate('owner', 'username firstname lastname')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.petModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: pets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<Pet> {
    ErrorHandlerUtil.validateObjectId(id, 'pet ID');

    const pet = await this.petModel
      .findById(id)
      .populate('owner', 'username firstname lastname')
      .populate('likedBy', 'username firstname lastname')
      .lean()
      .exec();

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return pet as Pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    ErrorHandlerUtil.validateObjectId(id, 'pet ID');

    const pet = await this.petModel
      .findByIdAndUpdate(id, updatePetDto, { new: true })
      .populate('owner', 'username firstname lastname')
      .exec();

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    this.logger.log(`Pet updated successfully: ${String(pet._id)}`);
    return pet;
  }

  async remove(id: string): Promise<{ message: string }> {
    ErrorHandlerUtil.validateObjectId(id, 'pet ID');

    const pet = await this.petModel.findById(id);
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // Check if pet is already adopted
    if (pet.status === PetStatus.ADOPTED) {
      throw new ConflictException('Cannot delete an adopted pet');
    }

    await this.petModel.findByIdAndDelete(id);
    this.logger.log(`Pet deleted successfully: ${id}`);
    return { message: 'Pet deleted successfully' };
  }

  async likePet(petId: string, userId: string): Promise<Pet> {
    ErrorHandlerUtil.validateObjectId(petId, 'pet ID');
    ErrorHandlerUtil.validateObjectId(userId, 'user ID');

    const pet = await this.petModel.findById(petId);
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if user already liked this pet
    if (pet.likedBy.includes(userObjectId)) {
      throw new ConflictException('Pet already liked by user');
    }

    pet.likedBy.push(userObjectId);
    await pet.save();

    return this.findOne(petId);
  }

  async unlikePet(petId: string, userId: string): Promise<Pet> {
    ErrorHandlerUtil.validateObjectId(petId, 'pet ID');
    ErrorHandlerUtil.validateObjectId(userId, 'user ID');

    const pet = await this.petModel.findById(petId);
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const userObjectId = new Types.ObjectId(userId);

    // Check if user has liked this pet
    if (!pet.likedBy.includes(userObjectId)) {
      throw new ConflictException('Pet not liked by user');
    }

    pet.likedBy = pet.likedBy.filter((id) => !id.equals(userObjectId));
    await pet.save();

    return this.findOne(petId);
  }

  async getUserPets(userId: string): Promise<Pet[]> {
    ErrorHandlerUtil.validateObjectId(userId, 'user ID');

    return this.petModel.find({ owner: userId }).sort({ createdAt: -1 }).exec();
  }

  async getUserLikedPets(userId: string): Promise<Pet[]> {
    ErrorHandlerUtil.validateObjectId(userId, 'user ID');

    return this.petModel
      .find({ likedBy: userId })
      .populate('owner', 'username firstname lastname')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Helper method for adoptions service to mark pet as adopted
   */
  async markAsAdopted(petId: string, ownerId: string): Promise<Pet> {
    ErrorHandlerUtil.validateObjectId(petId, 'pet ID');
    ErrorHandlerUtil.validateObjectId(ownerId, 'owner ID');

    const pet = await this.petModel.findById(petId);
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.status !== PetStatus.AVAILABLE) {
      throw new ConflictException('Pet is not available for adoption');
    }

    const userObjectId = new Types.ObjectId(ownerId);
    pet.owner = userObjectId;
    pet.status = PetStatus.ADOPTED;
    await pet.save();

    this.logger.log(`Pet ${petId} marked as adopted by user ${ownerId}`);
    return this.findOne(petId);
  }
}
