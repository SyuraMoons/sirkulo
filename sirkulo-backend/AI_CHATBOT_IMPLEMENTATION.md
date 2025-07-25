# AI Chatbot Implementation Guide

## Overview
This document provides a comprehensive guide for implementing the AI chatbot feature using Google Gemini API in the Sirkulo marketplace backend.

## Phase 1 & 2 Implementation Status ✅

### ✅ Phase 1: Foundation Setup
- **Gemini Configuration**: Created comprehensive configuration file with environment variables, safety settings, and generation parameters
- **Database Entities**: Implemented AI conversation and message entities with proper relationships
- **Database Migration**: Created SQL migration for AI conversation tables

### ✅ Phase 2: Core Services & API
- **AI Conversation Service**: Complete service with Gemini integration for message processing
- **REST API Controller**: Full CRUD operations for conversations and messages
- **Route Configuration**: Secure, validated API endpoints
- **Database Integration**: Updated TypeORM configuration for new entities

### ✅ Phase 3: Real-time Integration
- **Socket.IO Handler**: Complete real-time AI chat functionality with Socket.IO
- **Real-time Messaging**: Instant message delivery and AI responses
- **Typing Indicators**: Live typing indicators for both users and AI assistant
- **Connection Management**: Secure WebSocket authentication and room management
- **Frontend Integration**: Complete React hooks and client implementation

## Environment Setup

### Required Environment Variables
Add these to your `.env` file:

```env
# Google Gemini API Configuration
GEMINI_API_KEY=your_google_ai_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MAX_OUTPUT_TOKENS=2048
GEMINI_TEMPERATURE=0.7
GEMINI_TOP_P=0.8
GEMINI_TOP_K=40
```

### Getting Your Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Database Migration

Run the AI conversations migration:

```bash
# Apply the migration using Docker
docker exec -i sirkulo_postgres_dev psql -U sirkulo_user -d sirkulo_db < /home/bayu1/projects/garudahacks/sirkulo/sirkulo/sirkulo-backend/migrations/ai-conversations.sql
```

## API Endpoints

### REST API Endpoints

#### Create Conversation
```http
POST /api/ai/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "general",
  "title": "Help with recycling",
  "context": "User needs help understanding recycling processes"
}
```

#### Get User Conversations
```http
GET /api/ai/conversations?status=active&limit=20&offset=0
Authorization: Bearer <token>
```

#### Get Specific Conversation
```http
GET /api/ai/conversations/{conversation_id}
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/ai/conversations/{conversation_id}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "How can I recycle old clothing?"
}
```

### Socket.IO Events

#### Connection
```javascript
const socket = io('http://localhost:3000/ai-chat', {
  auth: { token: 'your-jwt-token' }
});
```

#### Create Conversation
```javascript
socket.emit('ai:create-conversation', {
  type: 'general',
  title: 'New AI Chat'
}, (response) => {
  console.log(response);
});
```

#### Join Conversation
```javascript
socket.emit('ai:join-conversation', {
  conversationId: 'conversation-id'
}, (response) => {
  console.log(response);
});
```

#### Send Message
```javascript
socket.emit('ai:send-message', {
  conversationId: 'conversation-id',
  content: 'Hello AI!'
}, (response) => {
  console.log(response);
});
```

#### Listen for Messages
```javascript
socket.on('ai:message-received', (message) => {
  console.log('New message:', message);
});

socket.on('ai:assistant-typing', (data) => {
  console.log('AI typing:', data.isTyping);
});
```

## Features Implemented

### 🤖 AI Conversation Management
- Create and manage AI conversations
- Multiple conversation types (general, product inquiry, order support, etc.)
- Conversation archiving and soft deletion
- Message history and context preservation

### 💬 Real-time Messaging
- Instant message delivery via Socket.IO
- Real-time AI response generation
- Live typing indicators for AI assistant
- Message status tracking (sending, sent, delivered, error)

### 🔄 Real-time Features
- **Live Typing Indicators**: Shows when AI is processing/typing
- **Instant Message Delivery**: Messages appear immediately for all participants
- **Connection Status**: Real-time connection status updates
- **Room Management**: Automatic joining/leaving of conversation rooms

### 🛡️ Security Features
- **WebSocket Authentication**: JWT token-based Socket.IO authentication
- **Room Access Control**: Users can only access their own conversations
- **Input Validation**: Message content validation and sanitization
- **Rate Limiting**: Built-in protection against spam

### 📊 Analytics & Monitoring
- Conversation statistics and metrics
- Token usage tracking
- Response time monitoring
- User engagement analytics

## Frontend Integration

### React Hook Usage
```javascript
import { useAIChat } from './ai-chat-client';

function AIChatComponent() {
  const { 
    isConnected, 
    conversations, 
    currentConversation, 
    messages, 
    isAssistantTyping,
    createConversation,
    joinConversation,
    sendMessage,
    loadConversations
  } = useAIChat(userToken);

  // Component implementation
}
```

### Complete Integration Guide
See `AI_CHAT_FRONTEND_INTEGRATION.md` for:
- Complete Socket.IO client implementation
- React hooks for AI chat functionality
- TypeScript interfaces and types
- Example React components
- Error handling patterns

## Testing Real-time Features

### Manual Testing Steps
1. **Start the server**: `npm run dev`
2. **Connect via Socket.IO**: Use the provided client code
3. **Create conversation**: Test conversation creation
4. **Send messages**: Verify real-time message delivery
5. **Test AI responses**: Confirm AI responses are generated and delivered
6. **Test typing indicators**: Verify typing indicators work correctly

### WebSocket Testing Tools
- **Socket.IO Client**: Use browser dev tools or Postman
- **Custom Test Client**: Use the provided frontend integration code

## Performance Optimizations

### Real-time Optimizations
- **Room-based Broadcasting**: Messages only sent to relevant users
- **Connection Pooling**: Efficient WebSocket connection management
- **Message Queuing**: Handles high-volume message scenarios
- **Typing Debouncing**: Prevents excessive typing indicator updates

### Monitoring Metrics
- WebSocket connection count
- Message delivery latency
- AI response generation time
- Error rates by event type

## Troubleshooting

### Common Issues
1. **"Socket connection failed"**: Check JWT token and server status
2. **"Messages not delivering"**: Verify room joining and user authentication
3. **"AI not responding"**: Check Gemini API key and service status
4. **"Typing indicators not working"**: Verify event emission and room membership

### Debug Mode
Set `NODE_ENV=development` for detailed WebSocket logging.

## Next Steps (Phase 4)

### Advanced Features
- **Multi-user Conversations**: Support for group AI chats
- **Voice Message Processing**: Audio input/output capabilities
- **File Sharing**: Document and image sharing in AI chats
- **Context Integration**: AI responses based on marketplace data
- **Multi-language Support**: Internationalization for AI responses

## Cost Management

### Real-time Optimization
- Connection limit management
- Message rate limiting
- Efficient room broadcasting
- Connection cleanup on disconnect

---

**Implementation Status**: ✅ Phase 1, 2 & 3 Complete
**Next Phase**: Advanced features and marketplace integration
**Last Updated**: 2024-01-15