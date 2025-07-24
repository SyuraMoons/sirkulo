import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import config from './config';

// Import routes
import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
// import listingRoutes from './routes/listing.routes';

/**
 * Sirkulo Backend Server
 * Main entry point for the circular economy B2B marketplace API
 */
class Server {
  private app: Application;

  constructor() {
    this.app = express();
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
      });
    });

    // API base route
    this.app.get('/api', (_req: express.Request, res: express.Response) => {
      res.status(200).json({
        message: 'Welcome to Sirkulo API',
        version: '1.0.0',
        documentation: '/api/docs',
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    // this.app.use('/api/users', userRoutes);
    // this.app.use('/api/listings', listingRoutes);

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

      // Start Express server
      this.app.listen(config.port, () => {
        console.log(`🚀 Sirkulo Backend server is running on port ${config.port}`);
        console.log(`📊 Environment: ${config.nodeEnv}`);
        console.log(`🔗 Health check: http://localhost:${config.port}/health`);
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
