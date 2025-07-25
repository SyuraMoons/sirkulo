import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from './index';
import { getRedisClient } from './redis';
import { MessagingSocketHandler } from '../handlers/messaging.socket.handler';

/**
 * Socket.IO Server Configuration
 * Handles real-time communication for the Sirkulo marketplace
 */
export interface AuthenticatedSocket extends Socket {
  userId?: number;
  userType?: 'buyer' | 'seller';
  email?: string;
}

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<number, string> = new Map(); // userId -> socketId
  private userSockets: Map<string, AuthenticatedSocket> = new Map(); // socketId -> socket
  private messagingHandler: MessagingSocketHandler;

  private constructor() {
    this.messagingHandler = new MessagingSocketHandler();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Initialize Socket.IO server
   */
  public initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    
    // Initialize messaging handlers
    this.messagingHandler.initializeHandlers(this.io);

    console.log('✅ Socket.IO server initialized');
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          throw new Error('No authentication token provided');
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace('Bearer ', '');
        
        // Verify JWT token
        const decoded = jwt.verify(cleanToken, config.jwt.secret) as any;
        
        // Check if token is blacklisted in Redis
        const redisClient = getRedisClient();
        if (redisClient) {
          const isBlacklisted = await redisClient.get(`blacklist:${cleanToken}`);
          if (isBlacklisted) {
            throw new Error('Token is blacklisted');
          }
        }

        // Attach user info to socket
        socket.userId = decoded.id;
        socket.userType = decoded.userType;
        socket.email = decoded.email;

        next();
      } catch (error) {
        console.error('❌ Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🔌 User connected: ${socket.userId} (${socket.id})`);

      // Store user connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
        this.userSockets.set(socket.id, socket);

        // Join user to their personal room
        socket.join(`user:${socket.userId}`);

        // Join user to their role-based room
        if (socket.userType) {
          socket.join(`role:${socket.userType}`);
        }
      }

      // Handle user joining specific rooms
      socket.on('join:order', (orderId: string) => {
        socket.join(`order:${orderId}`);
        console.log(`👤 User ${socket.userId} joined order room: ${orderId}`);
      });

      socket.on('join:listing', (listingId: string) => {
        socket.join(`listing:${listingId}`);
        console.log(`👤 User ${socket.userId} joined listing room: ${listingId}`);
      });

      socket.on('join:chat', (chatId: string) => {
        socket.join(`chat:${chatId}`);
        console.log(`👤 User ${socket.userId} joined chat room: ${chatId}`);
      });

      // Handle leaving rooms
      socket.on('leave:order', (orderId: string) => {
        socket.leave(`order:${orderId}`);
        console.log(`👤 User ${socket.userId} left order room: ${orderId}`);
      });

      socket.on('leave:listing', (listingId: string) => {
        socket.leave(`listing:${listingId}`);
        console.log(`👤 User ${socket.userId} left listing room: ${listingId}`);
      });

      socket.on('leave:chat', (chatId: string) => {
        socket.leave(`chat:${chatId}`);
        console.log(`👤 User ${socket.userId} left chat room: ${chatId}`);
      });

      // Handle real-time typing indicators
      socket.on('typing:start', (data: { chatId: string; userName: string }) => {
        socket.to(`chat:${data.chatId}`).emit('user:typing', {
          userId: socket.userId,
          userName: data.userName,
          isTyping: true,
        });
      });

      socket.on('typing:stop', (data: { chatId: string }) => {
        socket.to(`chat:${data.chatId}`).emit('user:typing', {
          userId: socket.userId,
          isTyping: false,
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 User disconnected: ${socket.userId} (${socket.id}) - Reason: ${reason}`);
        
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          this.userSockets.delete(socket.id);
        }
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for user ${socket.userId}:`, error);
      });
    });
  }

  /**
   * Get Socket.IO server instance
   */
  public getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Send notification to specific user
   */
  public sendToUser(userId: number, event: string, data: any): boolean {
    if (!this.io) return false;

    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user:${userId}`).emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * Send notification to multiple users
   */
  public sendToUsers(userIds: number[], event: string, data: any): number {
    if (!this.io) return 0;

    let sentCount = 0;
    userIds.forEach(userId => {
      if (this.sendToUser(userId, event, data)) {
        sentCount++;
      }
    });
    return sentCount;
  }

  /**
   * Send notification to all users in a role
   */
  public sendToRole(role: 'buyer' | 'seller', event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`role:${role}`).emit(event, data);
  }

  /**
   * Send notification to specific room
   */
  public sendToRoom(roomId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(roomId).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  /**
   * Get connected user count
   */
  public getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get connected users
   */
  public getConnectedUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Check if user is online
   */
  public isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get user's socket
   */
  public getUserSocket(userId: number): AuthenticatedSocket | null {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      return this.userSockets.get(socketId) || null;
    }
    return null;
  }
}

export default SocketService.getInstance();