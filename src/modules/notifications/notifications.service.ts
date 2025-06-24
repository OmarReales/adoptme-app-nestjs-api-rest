import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationType,
} from '../../schemas/notification.schema';
import { User } from '../../schemas/user.schema';
import {
  CreateNotificationDto,
  NotificationQueryDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Crear una notificación individual
  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    this.logger.log(
      `Creating notification for user ${createNotificationDto.recipient}`,
    );

    if (!Types.ObjectId.isValid(createNotificationDto.recipient)) {
      throw new BadRequestException('Invalid recipient ID');
    }

    // Verificar que el usuario existe
    const user = await this.userModel.findById(createNotificationDto.recipient);
    if (!user) {
      throw new NotFoundException('Recipient user not found');
    }

    const notification = new this.notificationModel(createNotificationDto);
    const savedNotification = await notification.save();

    await savedNotification.populate(
      'recipient',
      'username firstname lastname email',
    );

    this.logger.log(
      `Notification created with ID: ${String(savedNotification._id)}`,
    );
    return savedNotification;
  }

  // Crear notificaciones en lote (para múltiples usuarios)
  async createBulk(
    recipients: string[],
    notificationData: Omit<CreateNotificationDto, 'recipient'>,
  ): Promise<number> {
    this.logger.log(
      `Creating bulk notifications for ${recipients.length} users`,
    );

    const validRecipients = recipients.filter((id) =>
      Types.ObjectId.isValid(id),
    );
    if (validRecipients.length === 0) {
      throw new BadRequestException('No valid recipient IDs provided');
    }

    const notifications = validRecipients.map((recipientId) => ({
      ...notificationData,
      recipient: new Types.ObjectId(recipientId),
    }));

    const savedNotifications =
      await this.notificationModel.insertMany(notifications);
    this.logger.log(`Created ${savedNotifications.length} bulk notifications`);

    return savedNotifications.length;
  }

  // Obtener notificaciones del usuario con filtros
  async findUserNotifications(
    userId: string,
    query: NotificationQueryDto,
  ): Promise<{
    notifications: Notification[];
    unreadCount: number;
    total: number;
    page: number;
    limit: number;
  }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const { isRead, type, page = 1, limit = 20 } = query;
    const filter: Record<string, any> = { recipient: userId };

    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    if (type) {
      filter.type = type;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .populate('relatedId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({
        recipient: userId,
        isRead: false,
      }),
    ]);

    return {
      notifications,
      unreadCount,
      total,
      page,
      limit,
    };
  }

  // Marcar una notificación como leída
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestException('Invalid notification ID');
    }

    const notification = await this.notificationModel.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    this.logger.log(
      `Notification ${notificationId} marked as read by user ${userId}`,
    );
    return notification;
  }

  // Marcar múltiples notificaciones como leídas
  async markMultipleAsRead(
    notificationIds: string[],
    userId: string,
  ): Promise<number> {
    const validIds = notificationIds.filter((id) => Types.ObjectId.isValid(id));

    const result = await this.notificationModel.updateMany(
      {
        _id: { $in: validIds },
        recipient: userId,
        isRead: false,
      },
      { isRead: true },
    );

    this.logger.log(
      `Marked ${result.modifiedCount} notifications as read for user ${userId}`,
    );
    return result.modifiedCount;
  }

  // Marcar todas las notificaciones del usuario como leídas
  async markAllAsRead(userId: string): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const result = await this.notificationModel.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true },
    );

    this.logger.log(`Marked all notifications as read for user ${userId}`);
    return result.modifiedCount;
  }

  // Eliminar notificación
  async remove(notificationId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestException('Invalid notification ID');
    }

    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      recipient: userId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }

    this.logger.log(`Notification ${notificationId} deleted by user ${userId}`);
  }

  // Métodos helper para crear notificaciones específicas de adopción
  async notifyAdoptionRequest(
    adoptionId: string,
    petOwnerId: string,
    adopterName: string,
    petName: string,
  ): Promise<void> {
    await this.create({
      recipient: petOwnerId,
      type: NotificationType.ADOPTION_REQUEST,
      title: 'Nueva solicitud de adopción',
      message: `${adopterName} ha solicitado adoptar a ${petName}`,
      relatedId: adoptionId,
      relatedModel: 'Adoption',
      actionUrl: `/adoptions/${adoptionId}`,
      priority: 'high',
    });
  }

  async notifyAdoptionApproved(
    adopterId: string,
    petName: string,
    adoptionId: string,
  ): Promise<void> {
    await this.create({
      recipient: adopterId,
      type: NotificationType.ADOPTION_APPROVED,
      title: '¡Adopción aprobada!',
      message: `Tu solicitud para adoptar a ${petName} ha sido aprobada. ¡Felicidades!`,
      relatedId: adoptionId,
      relatedModel: 'Adoption',
      actionUrl: `/adoptions/${adoptionId}`,
      priority: 'high',
    });
  }

  async notifyAdoptionRejected(
    adopterId: string,
    petName: string,
    reason?: string,
  ): Promise<void> {
    const message = reason
      ? `Tu solicitud para adoptar a ${petName} ha sido rechazada. Motivo: ${reason}`
      : `Tu solicitud para adoptar a ${petName} ha sido rechazada.`;

    await this.create({
      recipient: adopterId,
      type: NotificationType.ADOPTION_REJECTED,
      title: 'Solicitud de adopción rechazada',
      message,
      priority: 'medium',
    });
  }

  async notifyNewPetAvailable(
    userIds: string[],
    petName: string,
    petId: string,
  ): Promise<void> {
    if (userIds.length === 0) return;

    await this.createBulk(userIds, {
      type: NotificationType.NEW_PET_AVAILABLE,
      title: 'Nueva mascota disponible',
      message: `${petName} está disponible para adopción`,
      relatedId: petId,
      relatedModel: 'Pet',
      actionUrl: `/pets/${petId}`,
      priority: 'medium',
    });
  }

  // Limpiar notificaciones expiradas (para ejecutar periódicamente)
  async cleanupExpiredNotifications(): Promise<number> {
    const result = await this.notificationModel.deleteMany({
      expiresAt: { $lte: new Date() },
    });

    this.logger.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result.deletedCount;
  }

  // Obtener estadísticas de notificaciones para admins
  async getNotificationStats(): Promise<{
    totalNotifications: number;
    unreadNotifications: number;
    notificationsByType: Record<string, number>;
  }> {
    interface AggregationResult {
      _id: string;
      count: number;
    }

    const [total, unread, byType] = await Promise.all([
      this.notificationModel.countDocuments(),
      this.notificationModel.countDocuments({ isRead: false }),
      this.notificationModel.aggregate<AggregationResult>([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    const notificationsByType: Record<string, number> = {};
    byType.forEach((item) => {
      notificationsByType[item._id] = item.count;
    });

    return {
      totalNotifications: total,
      unreadNotifications: unread,
      notificationsByType,
    };
  }
}
