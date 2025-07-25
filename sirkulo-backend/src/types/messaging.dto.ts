import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min, Max } from 'class-validator';

/**
 * DTO for creating a new conversation
 */
export class CreateConversationDto {
  @IsNumber()
  participantId: number;

  @IsOptional()
  @IsNumber()
  listingId?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(['direct', 'listing_inquiry'])
  type?: 'direct' | 'listing_inquiry';

  @IsOptional()
  @IsString()
  initialMessage?: string;
}

/**
 * DTO for sending a message
 */
export class SendMessageDto {
  @IsNumber()
  conversationId: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(['text', 'image', 'file'])
  messageType?: 'text' | 'image' | 'file';

  @IsOptional()
  @IsArray()
  attachments?: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }[];
}

/**
 * DTO for editing a message
 */
export class EditMessageDto {
  @IsString()
  content: string;
}

/**
 * DTO for conversation search and filtering
 */
export class ConversationSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['direct', 'listing_inquiry'])
  type?: 'direct' | 'listing_inquiry';

  @IsOptional()
  @IsNumber()
  listingId?: number;

  @IsOptional()
  @IsBoolean()
  hasUnreadMessages?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: 'lastMessageAt' | 'createdAt' | 'messageCount';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * DTO for message search and filtering
 */
export class MessageSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['text', 'image', 'file'])
  messageType?: 'text' | 'image' | 'file';

  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'updatedAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  beforeMessageId?: number;

  @IsOptional()
  @IsNumber()
  afterMessageId?: number;
}

/**
 * DTO for marking messages as read
 */
export class MarkMessagesReadDto {
  @IsNumber()
  conversationId: number;

  @IsOptional()
  @IsNumber()
  lastMessageId?: number;
}

/**
 * DTO for typing indicator
 */
export class TypingIndicatorDto {
  @IsNumber()
  conversationId: number;

  @IsBoolean()
  isTyping: boolean;
}

/**
 * DTO for file upload
 */
export class FileUploadDto {
  @IsString()
  filename: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;
}

/**
 * Response DTO for conversation
 */
export interface ConversationResponseDto {
  id: number;
  title: string;
  type: 'direct' | 'listing_inquiry';
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  messageCount: number;
  unreadCount: number;
  otherParticipant: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
  } | null;
  listing: {
    id: number;
    title: string;
    images: string[];
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response DTO for message
 */
export interface MessageResponseDto {
  id: number;
  content: string;
  messageType: 'text' | 'image' | 'file';
  attachments: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }[] | null;
  isRead: boolean;
  readAt: Date | null;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response DTO for conversation with messages
 */
export interface ConversationWithMessagesDto {
  conversation: ConversationResponseDto;
  messages: MessageResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Paginated response for conversations
 */
export interface PaginatedConversationsResponseDto {
  data: ConversationResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Paginated response for messages
 */
export interface PaginatedMessagesResponseDto {
  data: MessageResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Real-time message event data
 */
export interface MessageEventDto {
  conversationId: number;
  message: MessageResponseDto;
  recipientId: number;
}

/**
 * Real-time typing event data
 */
export interface TypingEventDto {
  conversationId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
}

/**
 * Real-time conversation update event data
 */
export interface ConversationUpdateEventDto {
  conversationId: number;
  type: 'new_message' | 'message_read' | 'conversation_updated';
  data: any;
  participants: number[];
}