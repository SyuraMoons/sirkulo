# Sirkulo Backend

A circular economy B2B marketplace backend for fashion waste, built with TypeScript, Node.js, Express, TypeORM, PostgreSQL, and Redis.

## 🏗️ Project Structure

```
sirkulo-backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Main configuration
│   │   ├── database.ts  # Database configuration
│   │   └── redis.ts     # Redis configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # TypeORM entity models
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── tests/           # Test files
│   └── server.ts        # Application entry point
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

5. **Start Redis server:**
   ```bash
   redis-server
   ```

6. **Run in development mode:**
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

## 🏛️ Architecture Overview

### Core Features

1. **Authentication & User Management**
   - JWT-based authentication
   - Multi-role support (User, Recycler, Business, Admin)
   - Mode switching between user types
   - Document verification workflows

2. **Waste Listings & Trading**
   - CRUD operations for waste listings
   - Advanced filtering and search
   - Geographic location support
   - Shopping cart and checkout system

3. **Bids & Upcycle Projects**
   - Recycler pickup bids
   - Creative upcycling project proposals
   - Acceptance and rejection workflows

4. **Payments & Transactions**
   - Xendit/Midtrans integration
   - Invoice generation
   - Payment status tracking
   - Webhook handling

5. **Logistics & Pickups**
   - Pickup scheduling
   - Status updates and notifications
   - Real-time tracking

6. **Communication & Notifications**
   - In-app messaging system
   - Push notifications via FCM
   - Email notifications

7. **Analytics & Impact Tracking**
   - Business analytics dashboard
   - Environmental impact metrics
   - Volume tracking

8. **Ratings & Reputation**
   - User feedback system
   - Reputation scoring
   - Automated badge awards

### Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with TypeORM
- **Caching:** Redis
- **Authentication:** JWT
- **Payment:** Xendit/Midtrans
- **Push Notifications:** Firebase Cloud Messaging
- **File Upload:** Multer
- **Real-time:** Socket.IO
- **Testing:** Jest
- **Linting:** ESLint
- **Code Quality:** Prettier

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- **Server Configuration:** PORT, NODE_ENV
- **Database:** DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
- **Redis:** REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- **JWT:** JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET
- **Payment:** XENDIT_SECRET_KEY, XENDIT_WEBHOOK_TOKEN
- **Firebase:** FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

## 📊 API Documentation

### Health Check
- `GET /health` - Server health status
- `GET /api` - API information

### Authentication (Coming Soon)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Users (Coming Soon)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/switch-mode` - Switch user mode

### Listings (Coming Soon)
- `GET /api/listings` - Get listings with filters
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing by ID
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🔍 Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📝 Contributing

1. Follow TypeScript and Node.js best practices
2. Use descriptive commit messages (Conventional Commits)
3. Write tests for new features
4. Ensure code passes linting
5. Update documentation as needed

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ for sustainable fashion and circular economy
