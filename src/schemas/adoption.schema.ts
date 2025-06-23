import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum AdoptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Adoption extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pet', required: true })
  pet: Types.ObjectId;

  @Prop({ enum: AdoptionStatus, default: AdoptionStatus.PENDING })
  status: AdoptionStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  adminApprover?: Types.ObjectId;

  @Prop()
  requestDate: Date;

  @Prop()
  approvedDate?: Date;

  @Prop()
  rejectedDate?: Date;

  @Prop()
  notes?: string;
}

export const AdoptionSchema = SchemaFactory.createForClass(Adoption);
