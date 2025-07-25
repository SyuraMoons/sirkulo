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

3. **Order Management System**
   - Complete order lifecycle management
   - Cart-to-order conversion
   - Multi-seller order support
   - Order status tracking (Pending → Delivered)
   - Payment status integration
   - Order analytics and statistics
   - Cancellation and refund handling

4. **Bids & Upcycle Projects**
   - Recycler pickup bids
   - Creative upcycling project proposals
   - Acceptance and rejection workflows

5. **Payments & Transactions**
   - Xendit/Midtrans integration
   - Invoice generation
   - Payment status tracking
   - Webhook handling

6. **Logistics & Pickups**
   - Pickup scheduling
   - Status updates and notifications
   - Real-time tracking

7. **Communication & Notifications**
   - In-app messaging system
   - Push notifications via FCM
   - Email notifications

8. **Analytics & Impact Tracking**
   - Business analytics dashboard
   - Environmental impact metrics
   - Volume tracking

9. **Ratings & Reputation**
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

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/switch-mode` - Switch user mode

### Listings

- `GET /api/listings` - Get listings with filters
- `POST /api/listings` - Create new listing
- `GET /api/listings/:id` - Get listing by ID
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Shopping Cart

- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart` - Clear entire cart

### Order Management 🆕

- `POST /api/orders` - Create order from cart
- `GET /api/orders` - Get orders with filters
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/stats` - Get order statistics
- `GET /api/orders/purchases` - Get buyer orders
- `GET /api/orders/sales` - Get seller orders

For detailed Order Management API documentation, see [ORDER_MANAGEMENT.md](./ORDER_MANAGEMENT.md)
### Payment Management 🆕

- `POST /api/payments` - Create payment for order
- `GET /api/payments` - Get payments with filters
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/:id/refund` - Create refund
- `GET /api/payments/stats` - Get payment statistics
- `GET /api/payments/methods` - Get supported payment methods
- `POST /api/payments/webhook` - Handle Xendit webhook

For detailed Payment API documentation, see [PAYMENT_API_DOCS.md](./PAYMENT_API_DOCS.md)

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
