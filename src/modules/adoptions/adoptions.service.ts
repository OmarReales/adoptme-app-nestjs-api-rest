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
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdoptionsService {
  private readonly logger = new Logger(AdoptionsService.name);
  constructor(
    @InjectModel(Adoption.name) private adoptionModel: Model<Adoption>,
    @InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(User.name) private userModel: Model<User>,
    private petsService: PetsService,
    private notificationsService: NotificationsService,
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

      // Obtener información del usuario para las notificaciones
      const userDoc = await this.userModel
        .findById(userId)
        .select('username')
        .lean();

      const adoptionId = (savedAdoption._id as Types.ObjectId).toString();

      // Notificar a todos los administradores sobre la nueva solicitud
      const admins = await this.userModel
        .find({ role: UserRole.ADMIN })
        .select('_id');

      for (const admin of admins) {
        await this.notificationsService.notifyAdoptionRequest(
          adoptionId,
          (admin._id as Types.ObjectId).toString(),
          userDoc?.username || 'Usuario',
          pet.name,
        );
      }

      this.logger.log(`Adoption request created with ID: ${adoptionId}`);
      return savedAdoption;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error creating adoption request: ${errorMessage}`,
        errorStack,
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
    const query: Record<string, unknown> = {};

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

      // Notificar al usuario que su adopción fue aprobada
      await this.notificationsService.notifyAdoptionApproved(
        adoption.user.toString(),
        pet.name,
        (adoption._id as Types.ObjectId).toString(),
      );

      // Reject all other pending adoption requests for this pet
      const otherPendingAdoptions = await this.adoptionModel
        .find({
          pet: adoption.pet,
          _id: { $ne: adoption._id },
          status: AdoptionStatus.PENDING,
        })
        .select('user');

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

      // Notificar a los usuarios cuyas solicitudes fueron rechazadas automáticamente
      for (const rejectedAdoption of otherPendingAdoptions) {
        try {
          await this.notificationsService.notifyAdoptionRejected(
            rejectedAdoption.user.toString(),
            pet.name,
            'La mascota fue adoptada por otro usuario',
          );
        } catch (error) {
          this.logger.warn(
            `Failed to send rejection notification to user ${String(rejectedAdoption.user)}: ${error}`,
          );
        }
      }

      this.logger.log(
        `Adoption approved: Pet ${String(pet._id)} adopted by user ${String(adoption.user)}`,
      );
    } else if (updateAdoptionDto.status === AdoptionStatus.REJECTED) {
      adoption.rejectedDate = new Date();

      // Notificar al usuario que su adopción fue rechazada
      await this.notificationsService.notifyAdoptionRejected(
        adoption.user.toString(),
        pet.name,
        updateAdoptionDto.notes,
      );

      this.logger.log(`Adoption request rejected: ${String(adoption._id)}`);
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

  async getSuccessStories(limit = 6): Promise<any[]> {
    try {
      const approvedAdoptions = await this.adoptionModel
        .find({ status: AdoptionStatus.APPROVED })
        .populate('pet', 'name image breed')
        .populate('user', 'firstname lastname')
        .sort({ approvedDate: -1 })
        .limit(limit)
        .exec();

      return approvedAdoptions.map((adoption: any) => ({
        petName: adoption.pet?.name || 'Mascota',
        image: adoption.pet?.image || '/images/placeholder-pet.jpg',
        familyName:
          `${adoption.user?.firstname || ''} ${adoption.user?.lastname || ''}`.trim(),
        story:
          adoption.notes ||
          'Una historia de amor que comenzó con una adopción.',
        adoptionDate: adoption.approvedDate,
        breed: adoption.pet?.breed || 'Desconocido',
      }));
    } catch (error) {
      this.logger.error('Error fetching success stories:', error);
      return [];
    }
  }
}
