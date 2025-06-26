import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PetStatus {
  AVAILABLE = 'available',
  ADOPTED = 'adopted',
  PENDING = 'pending',
}

export enum PetSpecies {
  DOG = 'dog',
  CAT = 'cat',
  RABBIT = 'rabbit',
  BIRD = 'bird',
  OTHER = 'other',
}

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Pet extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  breed: string;

  @Prop({ required: true, min: 0, max: 30 })
  age: number;

  @Prop({ enum: PetSpecies, required: true })
  species: PetSpecies;

  @Prop({ enum: PetGender, required: true })
  gender: PetGender;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  owner: Types.ObjectId | null;

  @Prop({ enum: PetStatus, default: PetStatus.AVAILABLE })
  status: PetStatus;

  @Prop()
  description?: string;

  @Prop()
  image?: string;

  @Prop({ type: [String], default: [] })
  characteristics: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likedBy: Types.ObjectId[];
}

export const PetSchema = SchemaFactory.createForClass(Pet);
