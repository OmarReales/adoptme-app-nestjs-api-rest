import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { Pet } from '../../schemas/pet.schema';
import { Adoption, AdoptionStatus } from '../../schemas/adoption.schema';
import { Notification } from '../../schemas/notification.schema';

export interface AppStats {
  totalPets: number;
  totalAdoptions: number;
  totalUsers: number;
  totalNotifications: number;
  availablePets: number;
  adoptedPets: number;
  pendingAdoptions: number;
  approvedAdoptions: number;
  rejectedAdoptions: number;
}

export interface AdoptionStats {
  totalAdoptions: number;
  pendingAdoptions: number;
  happyFamilies: number;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(Adoption.name) private adoptionModel: Model<Adoption>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async getAppStats(): Promise<AppStats> {
    const [
      totalUsers,
      totalPets,
      availablePets,
      adoptedPets,
      totalAdoptions,
      pendingAdoptions,
      approvedAdoptions,
      rejectedAdoptions,
      totalNotifications,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.petModel.countDocuments(),
      this.petModel.countDocuments({ status: 'available' }),
      this.petModel.countDocuments({ status: 'adopted' }),
      this.adoptionModel.countDocuments(),
      this.adoptionModel.countDocuments({ status: AdoptionStatus.PENDING }),
      this.adoptionModel.countDocuments({ status: AdoptionStatus.APPROVED }),
      this.adoptionModel.countDocuments({ status: AdoptionStatus.REJECTED }),
      this.notificationModel.countDocuments(),
    ]);

    return {
      totalUsers,
      totalPets,
      totalAdoptions,
      totalNotifications,
      availablePets,
      adoptedPets,
      pendingAdoptions,
      approvedAdoptions,
      rejectedAdoptions,
    };
  }

  async getAdoptionStats(): Promise<AdoptionStats> {
    const [totalAdoptions, pendingAdoptions, approvedAdoptions] =
      await Promise.all([
        this.adoptionModel.countDocuments(),
        this.adoptionModel.countDocuments({ status: AdoptionStatus.PENDING }),
        this.adoptionModel.countDocuments({ status: AdoptionStatus.APPROVED }),
      ]);

    return {
      totalAdoptions,
      pendingAdoptions,
      happyFamilies: approvedAdoptions,
    };
  }
}
