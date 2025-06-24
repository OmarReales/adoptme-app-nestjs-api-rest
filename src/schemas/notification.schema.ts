import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  ADOPTION_REQUEST = 'adoption_request',
  ADOPTION_APPROVED = 'adoption_approved',
  ADOPTION_REJECTED = 'adoption_rejected',
  NEW_PET_AVAILABLE = 'new_pet_available',
  REMINDER = 'reminder',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipient: Types.ObjectId;

  @Prop({ enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Types.ObjectId, refPath: 'relatedModel' })
  relatedId?: Types.ObjectId;

  @Prop({ enum: ['Pet', 'Adoption', 'User'] })
  relatedModel?: string;

  @Prop()
  actionUrl?: string; // URL para redireccionar desde la notificación

  @Prop()
  priority?: 'low' | 'medium' | 'high';

  @Prop()
  expiresAt?: Date; // Para notificaciones temporales
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Índices para mejorar performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
