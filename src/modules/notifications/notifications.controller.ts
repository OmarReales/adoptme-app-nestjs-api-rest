import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  MarkAsReadDto,
  NotificationQueryDto,
} from './dto/notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRole } from '../../schemas/user.schema';
import { RequestUser } from '../../common/interfaces/common.interfaces';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a notification (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Recipient user not found' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({
    name: 'isRead',
    required: false,
    type: String,
    enum: ['true', 'false'],
    example: 'false',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: [
      'adoption_request',
      'adoption_approved',
      'adoption_rejected',
      'new_pet_available',
      'reminder',
      'system_announcement',
    ],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'User notifications retrieved successfully',
  })
  findUserNotifications(
    @GetUser() user: RequestUser,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.findUserNotifications(user.userId, query);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get notification statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Notification statistics retrieved successfully',
  })
  getStats() {
    return this.notificationsService.getNotificationStats();
  }

  @Patch(':id/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  markAsRead(
    @Param('id', ParseMongoIdPipe) id: string,
    @GetUser() user: RequestUser,
  ) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Patch('mark-multiple-read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read successfully',
  })
  markMultipleAsRead(
    @Body() markAsReadDto: MarkAsReadDto,
    @GetUser() user: RequestUser,
  ) {
    return this.notificationsService.markMultipleAsRead(
      markAsReadDto.notificationIds,
      user.userId,
    );
  }

  @Patch('mark-all-read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
  })
  markAllAsRead(@GetUser() user: RequestUser) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  remove(
    @Param('id', ParseMongoIdPipe) id: string,
    @GetUser() user: RequestUser,
  ) {
    return this.notificationsService.remove(id, user.userId);
  }
}
