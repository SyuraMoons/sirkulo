import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import SocketService from './config/socket';
import config from './config';

// Import routes
import authRoutes from './routes/auth.routes';
import listingRoutes from './routes/listing.routes';
import cartRoutes from './routes/cart.routes';
import { orderRoutes } from './routes/order.routes';
import uploadRoutes from './routes/upload.routes';
import { paymentRoutes } from './routes/payment.routes';
import pushNotificationRoutes from './routes/push-notification.routes';
import searchRoutes from './routes/search.routes';
import ratingRoutes from './routes/rating.routes';
import messagingRoutes from './routes/messaging.routes';
import projectListingRoutes from './routes/project-listing.routes';
import craftsListingRoutes from './routes/crafts-listing.routes';

/**
 * Sirkulo Backend Server with Real-time Notifications
 * Main entry point for the circular economy B2B marketplace API
 */
class Server {
  private app: Application;
  private httpServer: any;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize Express middlewares
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true,
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging in development
    if (config.nodeEnv === 'development') {
      this.app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
        console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
        next();
      });
    }
  }

  /**
   * Initialize API routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: express.Request, res: express.Response) => {
      res.status(200).json({
        status: 'OK',
        message: 'Sirkulo Backend API is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        features: {
          socketIO: SocketService.getConnectedUserCount(),
          realTimeNotifications: true,
          firebasePush: !!process.env.FIREBASE_PROJECT_ID,
        },
      });
    });

    // API base route
    this.app.get('/api', (_req: express.Request, res: express.Response) => {
      res.status(200).json({
        message: 'Welcome to Sirkulo API',
        version: '1.0.0',
        documentation: '/api/docs',
        features: ['Real-time Notifications', 'Socket.IO', 'Firebase Push'],
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/listings', listingRoutes);
    this.app.use('/api/cart', cartRoutes);
    this.app.use('/api/orders', orderRoutes);
    this.app.use('/api/uploads', uploadRoutes);
    this.app.use('/api/payments', paymentRoutes);
    this.app.use('/api/notifications', pushNotificationRoutes);
    this.app.use('/api/search', searchRoutes);
    this.app.use('/api/ratings', ratingRoutes);
    this.app.use('/api/messaging', messagingRoutes);
    this.app.use('/api/projects', projectListingRoutes);
    this.app.use('/api/crafts', craftsListingRoutes);

    // 404 handler
    this.app.use('*', (req: express.Request, res: express.Response) => {
      res.status(404).json({
        status: 'error',
        message: 'Route not found',
        path: req.originalUrl,
      });
    });
  }

  /**
   * Initialize error handling middleware
   */
  private initializeErrorHandling(): void {
    this.app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('❌ Server Error:', error);
      
      res.status(500).json({
        status: 'error',
        message: config.nodeEnv === 'production' ? 'Internal server error' : error.message,
        ...(config.nodeEnv === 'development' && { stack: error.stack }),
      });
    });
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    try {
      // Initialize database connection
      await initializeDatabase();
      
      // Initialize Redis connection
      await initializeRedis();

      // Initialize Socket.IO server
      SocketService.initialize(this.httpServer);

      // Start HTTP server with Socket.IO
      this.httpServer.listen(config.port, () => {
        console.log(`🚀 Sirkulo Backend server is running on port ${config.port}`);
        console.log(`📊 Environment: ${config.nodeEnv}`);
        console.log(`🔗 Health check: http://localhost:${config.port}/health`);
        console.log(`⚡ Socket.IO server initialized`);
        console.log(`🔔 Real-time notifications enabled`);
        console.log(`📱 Firebase push notifications ${process.env.FIREBASE_PROJECT_ID ? 'configured' : 'not configured'}`);
        console.log(`📡 Socket.IO endpoint: ws://localhost:${config.port}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT signal received: closing HTTP server');
  process.exit(0);
});