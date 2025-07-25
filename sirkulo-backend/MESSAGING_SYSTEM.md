# Sirkulo Messaging System Documentation

## Overview

The Sirkulo messaging system provides comprehensive real-time communication capabilities for the B2B circular economy marketplace. It enables users to communicate through direct messages, inquire about listings, and receive real-time notifications.

## Architecture

### Components

1. **Models** (`src/models/`)
   - `Conversation.ts` - Conversation entity with participants and metadata
   - `Message.ts` - Message entity with content, attachments, and read status
   - `MessageAttachment.ts` - File attachments for messages

2. **DTOs** (`src/dto/messaging/`)
   - Request and response DTOs for all messaging operations
   - Validation schemas and type definitions

3. **Services** (`src/services/`)
   - `MessagingService.ts` - Core business logic for messaging operations

4. **Controllers** (`src/controllers/`)
   - `MessagingController.ts` - HTTP request handlers and validation

5. **Routes** (`src/routes/`)
   - `messaging.routes.ts` - Express routes with validation middleware

6. **Socket Handlers** (`src/handlers/`)
   - `messaging.socket.handler.ts` - Real-time Socket.IO event handlers

## Features

### Core Messaging
- ✅ Create conversations between users
- ✅ Send text, image, and file messages
- ✅ Message attachments support
- ✅ Edit and delete messages
- ✅ Message pagination and search
- ✅ Conversation filtering and search

### Real-time Features
- ✅ Instant message delivery
- ✅ Typing indicators
- ✅ Read receipts
- ✅ User online/offline status
- ✅ Real-time notifications

### Business Features
- ✅ Listing inquiry conversations
- ✅ Contact seller functionality
- ✅ Unread message counts
- ✅ Conversation types (general, listing_inquiry, support)

### Security & Validation
- ✅ JWT authentication
- ✅ Input validation and sanitization
- ✅ Rate limiting
- ✅ Access control (participants only)
- ✅ Content length limits

## API Endpoints

### Conversations

#### Create Conversation
```http
POST /api/messaging/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "participantId": 123,
  "type": "general",
  "listingId": 456,
  "initialMessage": "Hello, I'm interested in your listing"
}
```

#### Get User Conversations
```http
GET /api/messaging/conversations
Authorization: Bearer <token>

Query Parameters:
- search: string (optional) - Search in conversation titles
- type: string (optional) - Filter by type (general, listing_inquiry, support)
- listingId: number (optional) - Filter by listing ID
- hasUnreadMessages: boolean (optional) - Filter conversations with unread messages
- sortBy: string (optional) - Sort field (lastMessageAt, createdAt)
- sortOrder: string (optional) - Sort order (ASC, DESC)
- page: number (optional) - Page number (default: 1)
- limit: number (optional) - Items per page (default: 20, max: 100)
```

#### Get Conversation Details
```http
GET /api/messaging/conversations/:conversationId
Authorization: Bearer <token>
```

### Messages

#### Send Message
```http
POST /api/messaging/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": 123,
  "content": "Hello, this is a message",
  "type": "text",
  "attachments": [
    {
      "url": "https://example.com/file.pdf",
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 1024000
    }
  ]
}
```

#### Get Conversation Messages
```http
GET /api/messaging/conversations/:conversationId/messages
Authorization: Bearer <token>

Query Parameters:
- search: string (optional) - Search in message content
- messageType: string (optional) - Filter by type (text, image, file)
- unreadOnly: boolean (optional) - Show only unread messages
- beforeMessageId: number (optional) - Get messages before this ID
- afterMessageId: number (optional) - Get messages after this ID
- page: number (optional) - Page number
- limit: number (optional) - Items per page
```

#### Edit Message
```http
PATCH /api/messaging/messages/:messageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated message content"
}
```

#### Delete Message
```http
DELETE /api/messaging/messages/:messageId
Authorization: Bearer <token>
```

#### Mark Messages as Read
```http
POST /api/messaging/messages/read
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": 123,
  "messageIds": [1, 2, 3],
  "markAllAsRead": false
}
```

### Utility Endpoints

#### Get Unread Count
```http
GET /api/messaging/unread-count
Authorization: Bearer <token>
```

#### Contact Seller
```http
POST /api/messaging/listings/:listingId/contact
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I'm interested in this listing. Is it still available?"
}
```

#### Typing Indicator
```http
POST /api/messaging/typing
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": 123,
  "isTyping": true
}
```

## Socket.IO Events

### Connection

#### Authentication
```javascript
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Conversation Management

#### Join Conversation
```javascript
// Client sends
socket.emit('messaging:join_conversation', {
  conversationId: 123
});

// Server responds
socket.on('messaging:joined_conversation', (data) => {
  console.log('Joined conversation:', data.conversationId);
  console.log('Participants:', data.participants);
});

// Other participants receive
socket.on('messaging:user_joined', (data) => {
  console.log('User joined:', data.userId);
});
```

#### Leave Conversation
```javascript
// Client sends
socket.emit('messaging:leave_conversation', {
  conversationId: 123
});

// Server responds
socket.on('messaging:left_conversation', (data) => {
  console.log('Left conversation:', data.conversationId);
});
```

### Real-time Messaging

#### Send Message
```javascript
// Client sends
socket.emit('messaging:send_message', {
  conversationId: 123,
  content: 'Hello!',
  type: 'text'
});

// All participants receive
socket.on('messaging:new_message', (data) => {
  console.log('New message:', data.message);
});
```

#### Typing Indicators
```javascript
// Client sends
socket.emit('messaging:typing', {
  conversationId: 123,
  isTyping: true
});

// Other participants receive
socket.on('messaging:typing_indicator', (data) => {
  console.log(`User ${data.userId} is typing:`, data.isTyping);
});

// When typing stops
socket.on('messaging:typing_stopped', (data) => {
  console.log(`User ${data.userId} stopped typing`);
});
```

#### Read Receipts
```javascript
// Client sends
socket.emit('messaging:mark_read', {
  conversationId: 123,
  messageIds: [1, 2, 3]
});

// Other participants receive
socket.on('messaging:messages_read', (data) => {
  console.log(`User ${data.userId} read messages:`, data.messageIds);
});
```

### Status Updates

#### User Status
```javascript
// Client sends
socket.emit('messaging:update_status', {
  status: 'away' // online, away, busy
});

// Others receive
socket.on('messaging:user_status_updated', (data) => {
  console.log(`User ${data.userId} status:`, data.status);
});

// User goes offline
socket.on('messaging:user_offline', (data) => {
  console.log(`User ${data.userId} went offline`);
});
```

### Error Handling

```javascript
socket.on('messaging:error', (error) => {
  console.error('Messaging error:', error.message);
});
```

## Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('general', 'listing_inquiry', 'support')),
  listing_id INTEGER REFERENCES listings(id),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

### Conversation Participants Table
```sql
CREATE TABLE conversation_participants (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(conversation_id, user_id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'image', 'file')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP
);
```

### Message Attachments Table
```sql
CREATE TABLE message_attachments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Message Read Status Table
```sql
CREATE TABLE message_read_status (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_id, user_id)
);
```

## Usage Examples

### Frontend Integration

#### React Hook for Messaging
```javascript
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useMessaging = (token) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socketInstance = io('ws://localhost:3000', {
      auth: { token }
    });

    socketInstance.on('messaging:new_message', (data) => {
      setMessages(prev => ({
        ...prev,
        [data.message.conversationId]: [
          ...(prev[data.message.conversationId] || []),
          data.message
        ]
      }));
    });

    socketInstance.on('messaging:unread_count_updated', (data) => {
      setUnreadCount(data.count);
    });

    setSocket(socketInstance);

    return () => socketInstance.disconnect();
  }, [token]);

  const sendMessage = (conversationId, content, type = 'text') => {
    socket?.emit('messaging:send_message', {
      conversationId,
      content,
      type
    });
  };

  const joinConversation = (conversationId) => {
    socket?.emit('messaging:join_conversation', { conversationId });
  };

  return {
    socket,
    conversations,
    messages,
    unreadCount,
    sendMessage,
    joinConversation
  };
};
```

#### Message Component
```javascript
import React, { useState } from 'react';

export const MessageInput = ({ conversationId, onSendMessage }) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (content.trim()) {
      onSendMessage(conversationId, content);
      setContent('');
    }
  };

  const handleTyping = (typing) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      socket.emit('messaging:typing', {
        conversationId,
        isTyping: typing
      });
    }
  };

  return (
    <div className="message-input">
      <input
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          handleTyping(e.target.value.length > 0);
        }}
        onBlur={() => handleTyping(false)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};
```

## Performance Considerations

### Optimization Strategies

1. **Message Pagination**
   - Load messages in chunks (20-50 per page)
   - Implement virtual scrolling for large conversations
   - Cache recent messages in memory

2. **Real-time Scaling**
   - Use Redis for Socket.IO scaling across multiple servers
   - Implement connection pooling
   - Rate limit message sending (e.g., 10 messages per minute)

3. **Database Optimization**
   - Index frequently queried columns
   - Implement read replicas for message history
   - Archive old conversations

4. **Caching Strategy**
   - Cache conversation lists in Redis
   - Cache unread counts
   - Implement conversation metadata caching

### Rate Limiting

```javascript
// Example rate limiting configuration
const messageRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: 'Too many messages sent, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/messages', messageRateLimit, /* other middleware */);
```

## Security Best Practices

### Input Validation
- Sanitize all message content
- Validate file uploads (type, size, content)
- Implement content filtering for inappropriate content

### Access Control
- Verify user participation in conversations
- Implement proper JWT token validation
- Check permissions for message editing/deletion

### Data Protection
- Encrypt sensitive message content
- Implement message retention policies
- Secure file upload handling

## Testing

### Running Tests
```bash
# Run all messaging tests
npm test tests/messaging.integration.test.ts

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "Messaging System"
```

### Test Coverage
- ✅ REST API endpoints
- ✅ Socket.IO events
- ✅ Authentication and authorization
- ✅ Input validation
- ✅ Error handling
- ✅ Performance testing
- ✅ Security testing

## Deployment

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/sirkulo

# JWT
JWT_SECRET=your-secret-key

# Redis (for Socket.IO scaling)
REDIS_URL=redis://localhost:6379

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# Rate Limiting
MESSAGE_RATE_LIMIT=10  # messages per minute
```

### Docker Configuration
```dockerfile
# Add to your existing Dockerfile
EXPOSE 3000

# Ensure Redis is available for Socket.IO scaling
```

### Monitoring
- Monitor message delivery rates
- Track Socket.IO connection counts
- Alert on high error rates
- Monitor database performance

## Future Enhancements

### Planned Features
- [ ] Message reactions (like, dislike, emoji)
- [ ] Message threading/replies
- [ ] Voice messages
- [ ] Video calls integration
- [ ] Message encryption (end-to-end)
- [ ] Advanced file sharing
- [ ] Message scheduling
- [ ] Conversation templates
- [ ] AI-powered message suggestions
- [ ] Multi-language support

### Technical Improvements
- [ ] GraphQL subscriptions for real-time updates
- [ ] WebRTC for peer-to-peer communication
- [ ] Advanced caching strategies
- [ ] Message search with Elasticsearch
- [ ] Push notification improvements
- [ ] Offline message sync

## Support

For technical support or questions about the messaging system:

1. Check the API documentation
2. Review the test files for usage examples
3. Check the error logs for debugging information
4. Contact the development team

## Contributing

When contributing to the messaging system:

1. Follow the existing code structure
2. Add comprehensive tests for new features
3. Update documentation
4. Ensure backward compatibility
5. Follow security best practices