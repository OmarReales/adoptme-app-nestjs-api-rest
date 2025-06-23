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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error creating pet: ${errorMessage}`,
        'PetsService',
        errorStack,
      );
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: PetStatus,
    breed?: string,
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

    const skip = (page - 1) * limit;

    const [pets, total] = await Promise.all([
      this.petModel
        .find(query)
        .populate('owner', 'username firstname lastname')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
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
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid pet ID');
    }

    const pet = await this.petModel
      .findById(id)
      .populate('owner', 'username firstname lastname')
      .populate('likedBy', 'username firstname lastname')
      .exec();

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return pet;
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid pet ID');
    }

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
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid pet ID');
    }

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
    if (!Types.ObjectId.isValid(petId) || !Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid pet or user ID');
    }

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
    if (!Types.ObjectId.isValid(petId) || !Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid pet or user ID');
    }

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
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

    return this.petModel.find({ owner: userId }).sort({ createdAt: -1 }).exec();
  }

  async getUserLikedPets(userId: string): Promise<Pet[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID');
    }

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
    if (!Types.ObjectId.isValid(petId) || !Types.ObjectId.isValid(ownerId)) {
      throw new NotFoundException('Invalid pet or owner ID');
    }

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
