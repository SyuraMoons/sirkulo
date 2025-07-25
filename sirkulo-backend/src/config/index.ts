/**
 * Configuration for Sirkulo Backend Application
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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
 * Firebase configuration interface
 */
interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * JWT configuration interface
 */
interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

/**
 * Email configuration interface
 */
interface EmailConfig {
  provider: 'sendgrid' | 'smtp';
  sendgridApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Payment configuration interface
 */
interface PaymentConfig {
  xenditSecretKey: string;
  xenditWebhookToken: string;
  xenditPublicKey: string;
}

/**
 * Upload configuration interface
 */
interface UploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
  maxFiles: number;
}

/**
 * Frontend configuration interface
 */
interface FrontendConfig {
  baseUrl: string;
  verificationPath: string;
  resetPasswordPath: string;
}

/**
 * Main application configuration interface
 */
export interface AppConfig {
  nodeEnv: string;
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  firebase: FirebaseConfig;
  jwt: JwtConfig;
  email: EmailConfig;
  payment: PaymentConfig;
  upload: UploadConfig;
  frontend: FrontendConfig;
}

/**
 * Application configuration
 */
const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'sirkulo_user',
    password: process.env.DB_PASSWORD || 'sirkulo_secure_password_2024!',
    database: process.env.DB_NAME || 'sirkulo_db',
    synchronize: process.env.DB_SYNC === 'true' || false,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  email: {
    provider: (process.env.EMAIL_PROVIDER as 'sendgrid' | 'smtp') || 'sendgrid',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpSecure: process.env.SMTP_SECURE === 'true',
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    fromEmail: process.env.FROM_EMAIL || 'noreply@sirkulo.com',
    fromName: process.env.FROM_NAME || 'Sirkulo Team',
  },

  payment: {
    xenditSecretKey: process.env.XENDIT_SECRET_KEY || '',
    xenditWebhookToken: process.env.XENDIT_WEBHOOK_TOKEN || '',
    xenditPublicKey: process.env.XENDIT_PUBLIC_KEY || '',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    uploadPath: process.env.UPLOAD_PATH || 'uploads',
    maxFiles: parseInt(process.env.MAX_FILES || '10', 10),
  },

  frontend: {
    baseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    verificationPath: process.env.VERIFICATION_PATH || '/auth/verify',
    resetPasswordPath: process.env.RESET_PASSWORD_PATH || '/auth/reset-password',
  },
};

export default config;