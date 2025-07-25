import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration interface
 */
interface AppConfig {
  port: number;
  nodeEnv: string;
  baseUrl?: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  payment: PaymentConfig;
  firebase: FirebaseConfig;
  upload: UploadConfig;
  email: EmailConfig;
  frontend: FrontendConfig;
}

/**
 * Database configuration interface
 */
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize: boolean;
}

/**
 * Redis configuration interface
 */
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

/**
 * JWT configuration interface
 */
interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

/**
 * Payment gateway configuration interface
 */
interface PaymentConfig {
  xenditSecretKey: string;
  xenditWebhookToken: string;
}

/**
 * Firebase configuration interface
 */
interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * File upload configuration interface
 */
interface UploadConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
}

/**
 * Email configuration interface
 */
interface EmailConfig {
  provider: 'sendgrid';
  sendgrid: {
    apiKey: string;
  };
  from: {
    email: string;
    name: string;
  };
}

/**
 * Frontend configuration interface
 */
interface FrontendConfig {
  url: string;
}

/**
 * Main application configuration
 */
const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || undefined,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sirkulo_db',
    synchronize: process.env.DB_SYNC === 'true',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  payment: {
    xenditSecretKey: process.env.XENDIT_SECRET_KEY || '',
    xenditWebhookToken: process.env.XENDIT_WEBHOOK_TOKEN || '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png'],
  },
  email: {
    provider: 'sendgrid' as const,
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
    },
    from: {
      email: process.env.FROM_EMAIL || '',
      name: process.env.FROM_NAME || 'Sirkulo',
    },
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
};

export default config;
