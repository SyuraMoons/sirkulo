# Frontend-Backend Integration Setup Guide

This guide will help you set up and run the integrated Sirkulo application with both frontend and backend components.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v13 or higher)
3. **Redis** (v6 or higher)
4. **Expo CLI** (for mobile development)
5. **Google Gemini API Key** (for AI features)

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd sirkulo-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the environment template and configure:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=sirkulo_db
DB_SYNCHRONIZE=true

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# AI Configuration (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MAX_OUTPUT_TOKENS=2048
GEMINI_TEMPERATURE=0.7
GEMINI_TOP_P=0.8
GEMINI_TOP_K=10

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Firebase (Optional - for push notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### 4. Database Setup
Create PostgreSQL database:
```sql
CREATE DATABASE sirkulo_db;
```

Run database migrations:
```bash
# Using Docker (recommended)
npm run docker:dev

# Or manually with psql
psql -h localhost -p 5432 -U your_username -d sirkulo_db -f migrations/ai-conversations.sql
```

### 5. Start Redis Server
```bash
redis-server
```

### 6. Start Backend Server
```bash
npm run dev
```

The backend should now be running on `http://localhost:3000`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd .. # Back to root directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Frontend Development Server
```bash
npm start
```

### 4. Run on Device/Emulator
```bash
# For Android
npm run android

# For iOS (macOS only)
npm run ios

# For Web
npm run web
```

## Integration Features

### ✅ Implemented Features

1. **Authentication System**
   - User registration and login
   - JWT token management
   - Mode switching (Basic, Business, Recycler)
   - Automatic token refresh

2. **Shopping Cart Integration**
   - Real-time cart synchronization with backend
   - Persistent cart data across sessions
   - Add, remove, and update cart items
   - Cart validation and error handling

3. **Real-time AI Chat**
   - Socket.IO integration for real-time messaging
   - Google Gemini AI responses
   - Conversation management
   - Typing indicators
   - Connection status monitoring

4. **API Service Layer**
   - Centralized API communication
   - Error handling and retry logic
   - Token-based authentication
   - Request/response interceptors

5. **Context Management**
   - Authentication context with user state
   - Cart context with backend synchronization
   - Real-time chat hooks

### 🔄 Available API Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/switch-mode` - Mode switching
- `GET /api/auth/me` - Get user profile

#### Shopping Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

#### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create listing (Business mode)
- `GET /api/listings/:id` - Get specific listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

#### AI Chat
- `POST /api/ai/conversations` - Create AI conversation
- `GET /api/ai/conversations` - Get user conversations
- `GET /api/ai/conversations/:id` - Get conversation with messages
- `POST /api/ai/conversations/:id/messages` - Send AI message

#### Real-time Features (Socket.IO)
- Message broadcasting
- Typing indicators
- AI response streaming
- Connection status updates

## Testing the Integration

### 1. Test Authentication
1. Open the app and navigate to login
2. Create a new account or login with existing credentials
3. Verify that the user is redirected to the main app
4. Test mode switching between Basic, Business, and Recycler

### 2. Test Shopping Cart
1. Browse products in the app
2. Add items to cart
3. Verify cart count updates in real-time
4. Open cart screen and test quantity changes
5. Test cart persistence after app restart

### 3. Test AI Chat
1. Navigate to Messages → Ronto AI
2. Send a message about recycling or sustainability
3. Verify real-time AI responses
4. Test typing indicators
5. Check connection status indicator

### 4. Test Real-time Features
1. Open multiple instances of the app (or web version)
2. Send messages and verify real-time delivery
3. Test typing indicators between users
4. Verify socket connection status

## Troubleshooting

### Backend Issues
- **Database connection failed**: Check PostgreSQL is running and credentials are correct
- **Redis connection failed**: Ensure Redis server is running
- **AI responses not working**: Verify GEMINI_API_KEY is set correctly
- **Socket.IO issues**: Check CORS settings and frontend URL configuration

### Frontend Issues
- **API calls failing**: Verify backend is running on correct port
- **Authentication not working**: Check JWT token storage and API endpoints
- **Real-time features not working**: Verify Socket.IO connection and authentication
- **Cart not syncing**: Check authentication status and API connectivity

### Common Solutions
1. **Clear app storage**: Reset AsyncStorage if authentication issues persist
2. **Restart servers**: Restart both frontend and backend servers
3. **Check network**: Ensure frontend can reach backend (especially on physical devices)
4. **Verify environment variables**: Double-check all required environment variables are set

## Next Steps

### Potential Enhancements
1. **Order Management**: Integrate order creation and tracking
2. **Payment Integration**: Connect with payment gateways
3. **Push Notifications**: Implement Firebase push notifications
4. **File Upload**: Add image upload for listings and profiles
5. **Search & Filters**: Implement advanced search functionality
6. **Geolocation**: Add location-based features
7. **Analytics**: Implement user analytics and tracking

### Production Deployment
1. **Backend**: Deploy to cloud services (AWS, Google Cloud, etc.)
2. **Database**: Set up production PostgreSQL instance
3. **Redis**: Configure production Redis instance
4. **Frontend**: Build and deploy mobile app to app stores
5. **Environment**: Configure production environment variables
6. **Security**: Implement additional security measures
7. **Monitoring**: Set up logging and monitoring systems

## Support

For issues or questions about the integration:
1. Check the troubleshooting section above
2. Review the API documentation in the backend
3. Check the console logs for error messages
4. Verify all environment variables are correctly set

The integration provides a solid foundation for the Sirkulo MVP with real-time features, authentication, and seamless frontend-backend communication.