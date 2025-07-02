import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// Document interface for user documents
export interface UserDocument {
  name: string;
  reference: string;
  uploadDate: Date;
  size: number;
  mimeType: string;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User extends Document {
  @Prop({ required: true, unique: true, trim: true })
  userName: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, min: 18, max: 120 })
  age: number;

  @Prop({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        reference: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true },
      },
    ],
    default: [],
  })
  documents: UserDocument[];

  @Prop({ type: Date })
  lastConnection?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
