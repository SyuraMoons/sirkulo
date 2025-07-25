import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsObject, IsArray, IsEmail, IsIn } from 'class-validator';

/**
 * Notification type enumeration
 */
export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  LISTING_APPROVED = 'listing_approved',
  LISTING_REJECTED = 'listing_rejected',
  LISTING_EXPIRED = 'listing_expired',
  NEW_MESSAGE = 'new_message',
  PRICE_ALERT = 'price_alert',
  INVENTORY_LOW = 'inventory_low',
  ACCOUNT_VERIFIED = 'account_verified',
  SECURITY_ALERT = 'security_alert',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  PROMOTIONAL = 'promotional'
}

/**
 * Send notification DTO
 */
export class SendNotificationDto {
  @IsNumber()
  userId: number;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsIn(['low', 'normal', 'high'])
  priority?: 'low' | 'normal' | 'high';

  @IsOptional()
  @IsBoolean()
  persistent?: boolean;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;
}

/**
 * Bulk notification DTO
 */
export class BulkNotificationDto {
  @IsArray()
  @IsNumber({}, { each: true })
  userIds: number[];

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

/**
 * Role notification DTO
 */
export class RoleNotificationDto {
  @IsIn(['buyer', 'seller'])
  role: 'buyer' | 'seller';

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

/**
 * Device token registration DTO
 */
export class RegisterDeviceTokenDto {
  @IsString()
  token: string;

  @IsIn(['ios', 'android', 'web'])
  platform: 'ios' | 'android' | 'web';
}

/**
 * Notification preferences DTO
 */
export class NotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  orderUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  listingNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  messageNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  priceAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  securityAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  promotionalOffers?: boolean;
}

/**
 * Mark notifications as read DTO
 */
export class MarkNotificationsReadDto {
  @IsArray()
  @IsNumber({}, { each: true })
  notificationIds: number[];
}

/**
 * Get notifications query DTO
 */
export class GetNotificationsDto {
  @IsOptional()
  @IsNumber()
  limit?: number = 50;

  @IsOptional()
  @IsNumber()
  offset?: number = 0;

  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean = false;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

/**
 * Socket.IO event DTOs
 */
export class SocketJoinRoomDto {
  @IsString()
  roomId: string;

  @IsIn(['order', 'listing', 'chat'])
  roomType: 'order' | 'listing' | 'chat';
}

export class SocketTypingDto {
  @IsString()
  chatId: string;

  @IsOptional()
  @IsString()
  userName?: string;
}

/**
 * Notification response DTOs
 */
export class NotificationResponseDto {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export class BulkNotificationResponseDto {
  success: number;
  failed: number;
  totalSent: number;
}

export class NotificationStatsDto {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  lastNotificationAt?: Date;
}

/**
 * Firebase Cloud Messaging DTOs
 */
export class FCMMessageDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, string>;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  clickAction?: string;
}

export class FCMTopicDto {
  @IsString()
  topic: string;

  @IsArray()
  @IsString({ each: true })
  tokens: string[];
}

/**
 * Real-time event DTOs
 */
export class RealTimeEventDto {
  @IsString()
  event: string;

  @IsObject()
  data: any;

  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class UserTypingEventDto {
  userId: number;
  userName?: string;
  isTyping: boolean;
}

export class OrderUpdateEventDto {
  orderId: number;
  status: string;
  message: string;
  timestamp: Date;
}

export class MessageEventDto {
  messageId: number;
  chatId: string;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
}