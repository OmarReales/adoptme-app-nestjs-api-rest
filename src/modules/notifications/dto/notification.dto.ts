import {
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../../schemas/notification.schema';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Recipient user ID',
    example: '64f8b5c2e4b0a8f2c1d3e4f5',
  })
  @IsMongoId()
  recipient: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: NotificationType.ADOPTION_REQUEST,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'New adoption request',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'You have received a new adoption request for Buddy',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Related entity ID',
    example: '64f8b5c2e4b0a8f2c1d3e4f5',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  relatedId?: string;

  @ApiProperty({
    description: 'Related model type',
    enum: ['Pet', 'Adoption', 'User'],
    required: false,
  })
  @IsOptional()
  @IsString()
  relatedModel?: string;

  @ApiProperty({
    description: 'Action URL for notification',
    example: '/adoptions/64f8b5c2e4b0a8f2c1d3e4f5',
    required: false,
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiProperty({
    description: 'Notification priority',
    enum: ['low', 'medium', 'high'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';

  @ApiProperty({
    description: 'Expiration date for the notification',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class MarkAsReadDto {
  @ApiProperty({
    description: 'Array of notification IDs to mark as read',
    example: ['64f8b5c2e4b0a8f2c1d3e4f5', '64f8b5c2e4b0a8f2c1d3e4f6'],
  })
  @IsMongoId({ each: true })
  notificationIds: string[];
}

export class NotificationQueryDto {
  @ApiProperty({
    description: 'Filter by read status',
    required: false,
  })
  @IsOptional()
  @IsEnum(['true', 'false'])
  isRead?: string;

  @ApiProperty({
    description: 'Filter by notification type',
    enum: NotificationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  limit?: number;
}
