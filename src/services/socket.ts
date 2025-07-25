/**
 * Socket.IO Service
 * Handles real-time communication with the backend
 */

import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = __DEV__ ? 'http://localhost:3000' : 'https://your-production-api.com';

interface SocketMessage {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: string;
  isRead: boolean;
}

interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageCallbacks: ((message: SocketMessage) => void)[] = [];
  private aiMessageCallbacks: ((message: AIMessage) => void)[] = [];
  private typingCallbacks: ((data: { conversationId: string; isTyping: boolean; userId?: number }) => void)[] = [];
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  async connect(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found, skipping socket connection');
        return;
      }

      if (this.socket?.connected) {
        console.log('Socket already connected');
        return;
      }

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnected = true;
        this.connectionCallbacks.forEach(callback => callback(true));
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
        this.connectionCallbacks.forEach(callback => callback(false));
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        this.connectionCallbacks.forEach(callback => callback(false));
      });

      // Message events
      this.socket.on('message:received', (message: SocketMessage) => {
        console.log('Message received:', message);
        this.messageCallbacks.forEach(callback => callback(message));
      });

      this.socket.on('message:typing', (data: { conversationId: string; isTyping: boolean; userId: number }) => {
        this.typingCallbacks.forEach(callback => callback(data));
      });

      // AI Chat events
      this.socket.on('ai:message-received', (message: AIMessage) => {
        console.log('AI message received:', message);
        this.aiMessageCallbacks.forEach(callback => callback(message));
      });

      this.socket.on('ai:assistant-typing', (data: { conversationId: string; isTyping: boolean }) => {
        this.typingCallbacks.forEach(callback => callback({ ...data, userId: undefined }));
      });

    } catch (error) {
      console.error('Socket connection failed:', error);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionCallbacks.forEach(callback => callback(false));
    }
  }

  // Message methods
  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('conversation:join', { conversationId });
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('conversation:leave', { conversationId });
    }
  }

  sendMessage(conversationId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): void {
    if (this.socket?.connected) {
      this.socket.emit('message:send', {
        conversationId,
        content,
        type,
      });
    }
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit('message:typing', {
        conversationId,
        isTyping,
      });
    }
  }

  // AI Chat methods
  joinAIConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('ai:join-conversation', { conversationId });
    }
  }

  sendAIMessage(conversationId: string, content: string, metadata?: any): void {
    if (this.socket?.connected) {
      this.socket.emit('ai:send-message', {
        conversationId,
        content,
        metadata,
      });
    }
  }

  createAIConversation(type: string = 'general', title?: string): void {
    if (this.socket?.connected) {
      this.socket.emit('ai:create-conversation', {
        type,
        title,
      });
    }
  }

  // Event listeners
  onMessage(callback: (message: SocketMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  onAIMessage(callback: (message: AIMessage) => void): () => void {
    this.aiMessageCallbacks.push(callback);
    return () => {
      this.aiMessageCallbacks = this.aiMessageCallbacks.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (data: { conversationId: string; isTyping: boolean; userId?: number }) => void): () => void {
    this.typingCallbacks.push(callback);
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter(cb => cb !== callback);
    };
  }

  onConnection(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
    };
  }

  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
export default socketService;