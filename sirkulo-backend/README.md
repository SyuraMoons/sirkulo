# Sirkulo Backend

A comprehensive circular economy B2B marketplace backend for fashion waste, built with TypeScript, Node.js, Express, TypeORM, PostgreSQL, and Redis. Features real-time communication, AI-powered assistance, and complete marketplace functionality.

## 🏗️ Project Structure

```
sirkulo-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Main configuration
│   │   ├── database.ts  # Database configuration
│   │   ├── redis.ts     # Redis configuration
│   │   ├── socket.ts    # Socket.IO configuration
│   │   └── gemini.config.ts # AI configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # TypeORM entity models
│   ├── entities/        # AI conversation entities
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── sockets/         # Socket.IO handlers
│   ├── handlers/        # Event handlers
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── tests/           # Test files
│   └── server.ts        # Application entry point
├── migrations/          # Database migration files
├── dist/                # Compiled JavaScript (generated)
├── coverage/            # Test coverage reports (generated)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest test configuration
├── .eslintrc.js         # ESLint configuration
├── .env.example         # Environment variables template
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- npm or yarn
- Google Gemini API key (for AI features)

### Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd sirkulo-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE sirkulo_db;
   ```

5. **Run database migrations:**
   ```bash
   # Using Docker (recommended)
   docker exec -i sirkulo_postgres_dev psql -U sirkulo_user -d sirkulo_db < migrations/ai-conversations.sql
   
   # Or using psql directly
   psql -h localhost -p 5432 -U your_username -d sirkulo_db -f migrations/ai-conversations.sql
   ```

6. **Start Redis server:**
   ```bash
   redis-server
   ```

7. **Run in development mode:**
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run docker:dev` - Start development with Docker
- `npm run docker:dev:down` - Stop Docker development environment

## 🏛️ Architecture Overview

### Core Features

1. **Authentication & User Management**
   - JWT-based authentication with refresh tokens
   - Multi-role support (User, Recycler, Business, Admin)
   - Mode switching between user types
   - Document verification workflows
   - Email verification and password reset

2. **Waste Listings & Trading**
   - CRUD operations for waste listings
   - Advanced filtering and search capabilities
   - Geographic location support
   - Image upload and management
   - Shopping cart and checkout system
   - Inventory management

3. **Order Management System**
   - Complete order lifecycle management
   - Cart-to-order conversion
   - Multi-seller order support
   - Order status tracking (Pending → Processing → Shipped → Delivered)
   - Payment status integration
   - Order analytics and statistics
   - Cancellation and refund handling
   - Order history and tracking

4. **Real-time Communication System**
   - Socket.IO-based real-time messaging
   - In-app messaging between users
   - Live typing indicators
   - Message read status tracking
   - Push notifications via Firebase Cloud Messaging
   - Email notifications

5. **AI-Powered Chat Assistant** 🤖
   - Google Gemini AI integration
   - Real-time AI conversations via Socket.IO
   - Context-aware responses
   - Multiple conversation types (general, product inquiry, order support, etc.)
   - Conversation history and management
   - Live typing indicators for AI responses
   - Token usage tracking and cost management
   - Content safety and filtering

6. **Bids & Upcycle Projects**
   - Recycler pickup bids
   - Creative upcycling project proposals
   - Acceptance and rejection workflows
   - Project listing and management

7. **Payments & Transactions** ⚠️
   - **Note: Payment integration with Xendit is currently a placeholder implementation**
   - **This feature will be reconsidered and properly implemented in future development phases**
   - Invoice generation framework
   - Payment status tracking structure
   - Webhook handling architecture
   - Refund processing framework

8. **Logistics & Pickups**
   - Pickup scheduling system
   - Status updates and notifications
   - Location-based services
   - Delivery tracking framework

9. **Analytics & Impact Tracking**
   - Business analytics dashboard
   - Environmental impact metrics
   - Volume tracking and reporting
   - User engagement analytics
   - Performance monitoring

10. **Ratings & Reputation**
    - User feedback system
    - Rating and review management
    - Reputation scoring algorithms
    - Automated badge awards

11. **File Management & Upload**
    - Image upload and processing
    - File storage with metadata
    - Image optimization and resizing
    - Entity association (listings, users, etc.)

12. **Search & Discovery**
    - Advanced search functionality
    - Filtering by multiple criteria
    - Location-based search
    - Popular waste types tracking

### Technology Stack

#### Backend Core
- **Runtime:** Node.js (v18+) with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with TypeORM
- **Caching:** Redis
- **Authentication:** JWT with refresh tokens

#### Real-time & Communication
- **WebSocket:** Socket.IO for real-time features
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Email:** Nodemailer integration

#### AI & Machine Learning
- **AI Provider:** Google Gemini API (gemini-2.5-flash)
- **AI Features:** Conversational AI, content generation, context awareness
- **Safety:** Built-in content filtering and safety ratings

#### Payment & External Services
- **Payment Gateway:** Xendit (placeholder implementation)
- **File Upload:** Multer with Sharp for image processing
- **Validation:** Express Validator with custom rules

#### Development & Quality
- **Testing:** Jest with comprehensive test coverage
- **Linting:** ESLint with TypeScript support
- **Code Formatting:** Prettier
- **Security:** Helmet, CORS, rate limiting
- **Monitoring:** Custom logging and error tracking

#### Infrastructure
- **Containerization:** Docker support for development
- **Database Migrations:** SQL-based migration system
- **Environment Management:** dotenv configuration
- **Process Management:** PM2 ready for production

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

#### Server Configuration
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend application URL

#### Database Configuration
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_SYNCHRONIZE` - Auto-sync database schema (development only)

#### Redis Configuration
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `REDIS_PASSWORD` - Redis password (if required)

#### Authentication
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration

#### AI Configuration (Google Gemini)
- `GEMINI_API_KEY` - Google AI Studio API key
- `GEMINI_MODEL` - AI model (default: gemini-2.5-flash)
- `GEMINI_MAX_OUTPUT_TOKENS` - Maximum response tokens
- `GEMINI_TEMPERATURE` - Response creativity (0-1)
- `GEMINI_TOP_P` - Response diversity
- `GEMINI_TOP_K` - Response variety

#### Payment (Placeholder)
- `XENDIT_SECRET_KEY` - Xendit API secret
- `XENDIT_WEBHOOK_TOKEN` - Webhook verification token

#### Firebase (Push Notifications)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key

#### Email Configuration
- `EMAIL_HOST` - SMTP host
- `EMAIL_PORT` - SMTP port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password

## 📊 API Documentation

### Health Check & Info

- `GET /health` - Server health status with feature information
- `GET /api` - API information and available features

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password with token

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/switch-mode` - Switch user mode
- `POST /api/users/verify-email` - Verify email address

### Waste Listings

- `GET /api/listings` - Get listings with advanced filters
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing by ID
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/popular-types` - Get popular waste types

### Shopping Cart

- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart` - Clear entire cart

### Order Management

- `POST /api/orders` - Create order from cart
- `GET /api/orders` - Get orders with filters
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/stats` - Get order statistics
- `GET /api/orders/purchases` - Get buyer orders
- `GET /api/orders/sales` - Get seller orders

### Payment Management (Placeholder)

- `POST /api/payments` - Create payment for order
- `GET /api/payments` - Get payments with filters
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/:id/refund` - Create refund
- `GET /api/payments/stats` - Get payment statistics
- `POST /api/payments/webhook` - Handle payment webhook

### Real-time Messaging

- `GET /api/messaging/conversations` - Get user conversations
- `POST /api/messaging/conversations` - Create new conversation
- `GET /api/messaging/conversations/:id` - Get conversation details
- `POST /api/messaging/conversations/:id/messages` - Send message
- `PUT /api/messaging/messages/:id/read` - Mark message as read

### AI Chat Assistant 🤖

#### REST API
- `POST /api/ai/conversations` - Create AI conversation
- `GET /api/ai/conversations` - Get user's AI conversations
- `GET /api/ai/conversations/:id` - Get conversation with messages
- `POST /api/ai/conversations/:id/messages` - Send message to AI
- `PUT /api/ai/conversations/:id/archive` - Archive conversation
- `DELETE /api/ai/conversations/:id` - Delete conversation
- `GET /api/ai/conversations/:id/stats` - Get conversation statistics
- `GET /api/ai/conversation-types` - Get available conversation types

#### Socket.IO Events (Namespace: `/ai-chat`)
- `ai:create-conversation` - Create new AI conversation
- `ai:join-conversation` - Join conversation room
- `ai:send-message` - Send message with real-time AI response
- `ai:message-received` - Receive new messages
- `ai:assistant-typing` - AI typing indicators
- `ai:conversation-updated` - Live conversation updates

### File Upload & Management

- `POST /api/uploads/image` - Upload single image
- `POST /api/uploads/images` - Upload multiple images
- `GET /api/uploads/images/:id` - Get image by ID
- `DELETE /api/uploads/images/:id` - Delete image
- `POST /api/uploads/images/:id/associate` - Associate image with entity

### Push Notifications

- `POST /api/notifications/register` - Register device token
- `POST /api/notifications/send` - Send push notification
- `GET /api/notifications/test` - Test notification system

### Search & Discovery

- `GET /api/search` - Advanced search across listings
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/search/filters` - Get available search filters

### Ratings & Reviews

- `POST /api/ratings` - Create rating/review
- `GET /api/ratings` - Get ratings with filters
- `GET /api/ratings/:id` - Get rating by ID
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating

### Project Listings (Upcycling)

- `GET /api/projects` - Get project listings
- `POST /api/projects` - Create project listing
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Crafts Listings

- `GET /api/crafts` - Get craft listings
- `POST /api/crafts` - Create craft listing
- `GET /api/crafts/:id` - Get craft by ID
- `PUT /api/crafts/:id` - Update craft
- `DELETE /api/crafts/:id` - Delete craft

## 🤖 AI Chat Integration

### Frontend Integration

The AI chat system provides both REST API and real-time Socket.IO interfaces:

```javascript
// Socket.IO connection
const socket = io('http://localhost:3000/ai-chat', {
  auth: { token: 'your-jwt-token' }
});

// Create conversation
socket.emit('ai:create-conversation', {
  type: 'general',
  title: 'Help with recycling'
}, (response) => {
  console.log('Conversation created:', response);
});

// Send message with real-time AI response
socket.emit('ai:send-message', {
  conversationId: 'conv-id',
  content: 'How can I recycle old clothing?'
}, (response) => {
  console.log('AI response:', response);
});

// Listen for real-time events
socket.on('ai:message-received', (message) => {
  console.log('New message:', message);
});

socket.on('ai:assistant-typing', (data) => {
  console.log('AI is typing:', data.isTyping);
});
```

### Features
- **Real-time AI Responses**: Instant AI-generated responses via Google Gemini
- **Conversation Management**: Create, archive, and manage AI conversations
- **Typing Indicators**: Live indicators when AI is processing responses
- **Context Awareness**: AI maintains conversation context and history
- **Multiple Conversation Types**: General, product inquiry, order support, etc.
- **Content Safety**: Built-in content filtering and safety measures
- **Token Tracking**: Monitor AI usage and costs

For detailed AI chat integration, see `AI_CHAT_FRONTEND_INTEGRATION.md`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test suites
npm test -- --testPathPattern=auth
npm test -- --testPathPattern=orders
npm test -- --testPathPattern=ai-conversation
```

### Test Coverage

The project includes comprehensive test coverage for:
- Authentication and authorization
- Order management workflows
- Payment processing (placeholder)
- Real-time messaging
- AI conversation features
- File upload and management
- Database operations

## 🔍 Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Check TypeScript compilation
npm run build
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration:**
   ```bash
   NODE_ENV=production
   # Set all required environment variables
   ```

2. **Database Setup:**
   ```bash
   # Run migrations
   npm run migrations:run
   ```

3. **Build and Start:**
   ```bash
   npm run build
   npm start
   ```

### Docker Deployment

```bash
# Development
npm run docker:dev

# Production (customize docker-compose.yml)
docker-compose up -d
```

## ⚠️ Important Notes

### Payment System Disclaimer

**The Xendit payment integration is currently implemented as a placeholder and is not production-ready.** This includes:

- Payment processing endpoints
- Webhook handling
- Refund management
- Transaction tracking

**Future Development:** The payment system will be reconsidered and properly implemented in future development phases based on:
- Business requirements
- Regional payment preferences
- Compliance and security standards
- Integration complexity and costs


### Real-time Features

Socket.IO features require both Redis and proper WebSocket support in your deployment environment.

## 📈 Performance Considerations

- **Database Indexing:** Optimized indexes for frequent queries
- **Caching Strategy:** Redis caching for session management and frequent data
- **Connection Pooling:** Efficient database connection management
- **Rate Limiting:** API rate limiting to prevent abuse
- **Image Optimization:** Automatic image resizing and compression
- **Real-time Optimization:** Room-based broadcasting for efficient WebSocket communication

## 🔒 Security Features

- **Authentication:** JWT with refresh token rotation
- **Authorization:** Role-based access control
- **Input Validation:** Comprehensive request validation
- **SQL Injection Prevention:** TypeORM query builder and parameterized queries
- **XSS Protection:** Helmet.js security headers
- **CORS Configuration:** Proper cross-origin resource sharing setup
- **Rate Limiting:** Request rate limiting per IP/user
- **Content Security:** AI-powered content filtering and safety measures

## 📝 Contributing

1. Follow TypeScript and Node.js best practices
2. Use descriptive commit messages (Conventional Commits)
3. Write tests for new features
4. Ensure code passes linting and type checking
5. Update documentation as needed
6. Test real-time features with Socket.IO clients
7. Verify AI chat functionality with proper API keys

## 📚 Documentation

- `AI_CHATBOT_IMPLEMENTATION.md` - Complete AI chat implementation guide
- `AI_CHAT_FRONTEND_INTEGRATION.md` - Frontend integration examples
- `ORDER_MANAGEMENT.md` - Order system documentation
- `PAYMENT_API_DOCS.md` - Payment API documentation (placeholder)
- `FIREBASE_PUSH_NOTIFICATIONS.md` - Push notification setup
- `FIREBASE_VALIDATION_SUMMARY.md` - Firebase integration validation

## 📄 License

MIT License - see LICENSE file for details

---
