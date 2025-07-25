import request from 'supertest';
import { Server } from 'http';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import config from '../src/config';

/**
 * Messaging System Integration Tests
 * Tests the complete messaging functionality including REST API and Socket.IO
 */

describe('Messaging System Integration Tests', () => {
  let server: Server;
  let app: any;
  let authToken1: string;
  let authToken2: string;
  let userId1: number;
  let userId2: number;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  let conversationId: number;

  beforeAll(async () => {
    // Initialize test server and database
    // This would typically be done in a test setup file
    
    // Create test users and get auth tokens
    userId1 = 1;
    userId2 = 2;
    
    authToken1 = jwt.sign(
      { userId: userId1, email: 'user1@test.com' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    authToken2 = jwt.sign(
      { userId: userId2, email: 'user2@test.com' },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup
    if (clientSocket1) clientSocket1.disconnect();
    if (clientSocket2) clientSocket2.disconnect();
    if (server) server.close();
  });

  describe('REST API Endpoints', () => {
    describe('POST /api/messaging/conversations', () => {
      it('should create a new conversation', async () => {
        const response = await request(app)
          .post('/api/messaging/conversations')
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            participantId: userId2,
            type: 'general',
            initialMessage: 'Hello, this is a test message'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.conversation).toBeDefined();
        expect(response.body.data.conversation.type).toBe('general');
        expect(response.body.data.message).toBeDefined();
        
        conversationId = response.body.data.conversation.id;
      });

      it('should return validation error for invalid participant ID', async () => {
        const response = await request(app)
          .post('/api/messaging/conversations')
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            participantId: 'invalid',
            type: 'general'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });

      it('should return unauthorized without token', async () => {
        const response = await request(app)
          .post('/api/messaging/conversations')
          .send({
            participantId: userId2,
            type: 'general'
          });

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/messaging/conversations', () => {
      it('should get user conversations', async () => {
        const response = await request(app)
          .get('/api/messaging/conversations')
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.conversations).toBeDefined();
        expect(Array.isArray(response.body.data.conversations)).toBe(true);
      });

      it('should filter conversations by type', async () => {
        const response = await request(app)
          .get('/api/messaging/conversations?type=general')
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.conversations).toBeDefined();
      });

      it('should paginate conversations', async () => {
        const response = await request(app)
          .get('/api/messaging/conversations?page=1&limit=10')
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.pagination).toBeDefined();
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(10);
      });
    });

    describe('GET /api/messaging/conversations/:conversationId', () => {
      it('should get conversation details', async () => {
        const response = await request(app)
          .get(`/api/messaging/conversations/${conversationId}`)
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.conversation).toBeDefined();
        expect(response.body.data.conversation.id).toBe(conversationId);
      });

      it('should return 404 for non-existent conversation', async () => {
        const response = await request(app)
          .get('/api/messaging/conversations/99999')
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/messaging/messages', () => {
      it('should send a text message', async () => {
        const response = await request(app)
          .post('/api/messaging/messages')
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            conversationId: conversationId,
            content: 'This is a test message',
            type: 'text'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBeDefined();
        expect(response.body.data.message.content).toBe('This is a test message');
        expect(response.body.data.message.type).toBe('text');
      });

      it('should send a message with attachments', async () => {
        const response = await request(app)
          .post('/api/messaging/messages')
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            conversationId: conversationId,
            content: 'Message with attachment',
            type: 'image',
            attachments: [{
              url: 'https://example.com/image.jpg',
              filename: 'image.jpg',
              mimeType: 'image/jpeg',
              size: 1024
            }]
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.message.attachments).toBeDefined();
        expect(response.body.data.message.attachments.length).toBe(1);
      });

      it('should return validation error for invalid message type', async () => {
        const response = await request(app)
          .post('/api/messaging/messages')
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            conversationId: conversationId,
            content: 'Test message',
            type: 'invalid_type'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });
    });

    describe('GET /api/messaging/conversations/:conversationId/messages', () => {
      it('should get conversation messages', async () => {
        const response = await request(app)
          .get(`/api/messaging/conversations/${conversationId}/messages`)
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.messages).toBeDefined();
        expect(Array.isArray(response.body.data.messages)).toBe(true);
      });

      it('should paginate messages', async () => {
        const response = await request(app)
          .get(`/api/messaging/conversations/${conversationId}/messages?page=1&limit=5`)
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should search messages by content', async () => {
        const response = await request(app)
          .get(`/api/messaging/conversations/${conversationId}/messages?search=test`)
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('POST /api/messaging/messages/read', () => {
      it('should mark messages as read', async () => {
        const response = await request(app)
          .post('/api/messaging/messages/read')
          .set('Authorization', `Bearer ${authToken2}`)
          .send({
            conversationId: conversationId,
            markAllAsRead: true
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should mark specific messages as read', async () => {
        const response = await request(app)
          .post('/api/messaging/messages/read')
          .set('Authorization', `Bearer ${authToken2}`)
          .send({
            conversationId: conversationId,
            messageIds: [1, 2, 3]
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    describe('GET /api/messaging/unread-count', () => {
      it('should get unread message count', async () => {
        const response = await request(app)
          .get('/api/messaging/unread-count')
          .set('Authorization', `Bearer ${authToken1}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.count).toBeDefined();
        expect(typeof response.body.data.count).toBe('number');
      });
    });

    describe('POST /api/messaging/listings/:listingId/contact', () => {
      it('should contact seller about a listing', async () => {
        const listingId = 1; // Assume this listing exists
        
        const response = await request(app)
          .post(`/api/messaging/listings/${listingId}/contact`)
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            message: 'I am interested in this listing'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.conversation).toBeDefined();
        expect(response.body.data.message).toBeDefined();
      });

      it('should return validation error for empty message', async () => {
        const listingId = 1;
        
        const response = await request(app)
          .post(`/api/messaging/listings/${listingId}/contact`)
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            message: ''
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });
    });
  });

  describe('Socket.IO Real-time Features', () => {
    beforeAll((done) => {
      // Connect socket clients
      clientSocket1 = Client(`http://localhost:${config.port}`, {
        auth: { token: authToken1 }
      });
      
      clientSocket2 = Client(`http://localhost:${config.port}`, {
        auth: { token: authToken2 }
      });

      let connectedCount = 0;
      const checkConnection = () => {
        connectedCount++;
        if (connectedCount === 2) done();
      };

      clientSocket1.on('connect', checkConnection);
      clientSocket2.on('connect', checkConnection);
    });

    describe('Conversation Management', () => {
      it('should join conversation room', (done) => {
        clientSocket1.emit('messaging:join_conversation', {
          conversationId: conversationId
        });

        clientSocket1.on('messaging:joined_conversation', (data) => {
          expect(data.conversationId).toBe(conversationId);
          expect(data.participants).toBeDefined();
          done();
        });
      });

      it('should notify when user joins conversation', (done) => {
        clientSocket2.emit('messaging:join_conversation', {
          conversationId: conversationId
        });

        clientSocket1.on('messaging:user_joined', (data) => {
          expect(data.userId).toBe(userId2);
          expect(data.conversationId).toBe(conversationId);
          done();
        });
      });
    });

    describe('Real-time Messaging', () => {
      it('should send and receive messages in real-time', (done) => {
        const testMessage = 'Real-time test message';

        clientSocket2.on('messaging:new_message', (data) => {
          expect(data.message.content).toBe(testMessage);
          expect(data.message.senderId).toBe(userId1);
          done();
        });

        clientSocket1.emit('messaging:send_message', {
          conversationId: conversationId,
          content: testMessage,
          type: 'text'
        });
      });

      it('should handle message with attachments', (done) => {
        const messageData = {
          conversationId: conversationId,
          content: 'Message with attachment',
          type: 'image',
          attachments: [{
            url: 'https://example.com/test.jpg',
            filename: 'test.jpg',
            mimeType: 'image/jpeg',
            size: 2048
          }]
        };

        clientSocket2.on('messaging:new_message', (data) => {
          expect(data.message.attachments).toBeDefined();
          expect(data.message.attachments.length).toBe(1);
          expect(data.message.attachments[0].filename).toBe('test.jpg');
          done();
        });

        clientSocket1.emit('messaging:send_message', messageData);
      });
    });

    describe('Typing Indicators', () => {
      it('should send and receive typing indicators', (done) => {
        clientSocket2.on('messaging:typing_indicator', (data) => {
          expect(data.userId).toBe(userId1);
          expect(data.conversationId).toBe(conversationId);
          expect(data.isTyping).toBe(true);
          done();
        });

        clientSocket1.emit('messaging:typing', {
          conversationId: conversationId,
          isTyping: true
        });
      });

      it('should handle stop typing', (done) => {
        clientSocket2.on('messaging:typing_stopped', (data) => {
          expect(data.userId).toBe(userId1);
          expect(data.conversationId).toBe(conversationId);
          done();
        });

        clientSocket1.emit('messaging:typing', {
          conversationId: conversationId,
          isTyping: false
        });
      });
    });

    describe('Read Receipts', () => {
      it('should send and receive read receipts', (done) => {
        clientSocket1.on('messaging:messages_read', (data) => {
          expect(data.userId).toBe(userId2);
          expect(data.conversationId).toBe(conversationId);
          done();
        });

        clientSocket2.emit('messaging:mark_read', {
          conversationId: conversationId,
          messageIds: [1, 2]
        });
      });
    });

    describe('User Status', () => {
      it('should update and broadcast user status', (done) => {
        clientSocket2.on('messaging:user_status_updated', (data) => {
          expect(data.userId).toBe(userId1);
          expect(data.status).toBe('away');
          done();
        });

        clientSocket1.emit('messaging:update_status', {
          status: 'away'
        });
      });

      it('should handle user offline status on disconnect', (done) => {
        clientSocket1.on('messaging:user_offline', (data) => {
          expect(data.userId).toBe(userId2);
          done();
        });

        clientSocket2.disconnect();
      });
    });

    describe('Error Handling', () => {
      it('should handle authentication errors', (done) => {
        const invalidClient = Client(`http://localhost:${config.port}`, {
          auth: { token: 'invalid_token' }
        });

        invalidClient.on('connect_error', (error) => {
          expect(error.message).toContain('Authentication failed');
          invalidClient.disconnect();
          done();
        });
      });

      it('should handle invalid conversation access', (done) => {
        clientSocket1.on('messaging:error', (data) => {
          expect(data.message).toContain('Conversation not found');
          done();
        });

        clientSocket1.emit('messaging:join_conversation', {
          conversationId: 99999 // Non-existent conversation
        });
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent messages', async () => {
      const messagePromises = [];
      
      for (let i = 0; i < 10; i++) {
        const promise = request(app)
          .post('/api/messaging/messages')
          .set('Authorization', `Bearer ${authToken1}`)
          .send({
            conversationId: conversationId,
            content: `Performance test message ${i}`,
            type: 'text'
          });
        
        messagePromises.push(promise);
      }

      const responses = await Promise.all(messagePromises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    it('should handle pagination efficiently', async () => {
      const response = await request(app)
        .get(`/api/messaging/conversations/${conversationId}/messages?page=1&limit=50`)
        .set('Authorization', `Bearer ${authToken1}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.messages.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Security Tests', () => {
    it('should prevent access to other users\' conversations', async () => {
      // Create a conversation as user1
      const createResponse = await request(app)
        .post('/api/messaging/conversations')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          participantId: 3, // Different user
          type: 'general'
        });

      const newConversationId = createResponse.body.data.conversation.id;

      // Try to access it as user2 (who is not a participant)
      const accessResponse = await request(app)
        .get(`/api/messaging/conversations/${newConversationId}`)
        .set('Authorization', `Bearer ${authToken2}`);

      expect(accessResponse.status).toBe(404);
    });

    it('should validate message content length', async () => {
      const longContent = 'a'.repeat(5001); // Exceeds 5000 char limit

      const response = await request(app)
        .post('/api/messaging/messages')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          conversationId: conversationId,
          content: longContent,
          type: 'text'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should sanitize message content', async () => {
      const maliciousContent = '<script>alert("xss")</script>Test message';

      const response = await request(app)
        .post('/api/messaging/messages')
        .set('Authorization', `Bearer ${authToken1}`)
        .send({
          conversationId: conversationId,
          content: maliciousContent,
          type: 'text'
        });

      expect(response.status).toBe(201);
      // Content should be sanitized (implementation depends on sanitization library)
      expect(response.body.data.message.content).not.toContain('<script>');
    });
  });
});

/**
 * Test utilities
 */
export const MessagingTestUtils = {
  /**
   * Create test conversation
   */
  async createTestConversation(app: any, authToken: string, participantId: number) {
    const response = await request(app)
      .post('/api/messaging/conversations')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        participantId,
        type: 'general',
        initialMessage: 'Test conversation'
      });

    return response.body.data.conversation;
  },

  /**
   * Send test message
   */
  async sendTestMessage(app: any, authToken: string, conversationId: number, content: string = 'Test message') {
    const response = await request(app)
      .post('/api/messaging/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        conversationId,
        content,
        type: 'text'
      });

    return response.body.data.message;
  },

  /**
   * Wait for socket event
   */
  waitForSocketEvent(socket: ClientSocket, event: string, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Socket event '${event}' not received within ${timeout}ms`));
      }, timeout);

      socket.once(event, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  },

  /**
   * Generate JWT token for testing
   */
  generateTestToken(userId: number, email: string): string {
    return jwt.sign(
      { userId, email },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  }
};