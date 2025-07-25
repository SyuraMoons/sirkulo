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
    projectId: process.env.FIREBASE_PROJECT_ID || 'sirkulo-c2459',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@sirkulo-c2459.iam.gserviceaccount.com',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQClCOAT6Olzwco+\nlsQGBLYNhof7pOAZpIRRWNWXHeT6RDAAmt3Wsjbw6MG0drdiuJiQhzRlZ4W30zT0\nT/1EBb56Pwa0Mi5xjeZ8gFyuZIItKXSQDmKh2x9JQEpvGdvNDX7+P4w73Y6oknXi\n5DRSLviJEpjR/w+EDPn9UqgKocdSVoo++XJF3+WE9xTZxxFwKWug+/2QtBJx2NCr\nth3YVmG1q65hMcPtmcDEBHJVi3ZrkJXuI+gW8WYAOe1THfizqrrr9c3QH1DhRj4H\nCiSN9HpKFak+3GSZucN04qRcZeMfdMXrlds7gA6QKAIAF9GI08kIBfxKtvXlO2zH\njVX0srmrAgMBAAECggEAL+x23XE6MZIpv6kaPUEq+JyDanDDXs7mWZT5WUumDYK1\nicdu+gSAbc65SUVcFX/TVczdS0EXlHzxmKyNuC4O1QLuWG9mCzWQo8DGqSGop6Kt\nJZP30laGLEhOFRsmN9JeeUhM2amJ3qvBLeTkyKS5KVzMIdb2U3tNMOHKyGOYNPFS\nhfH7jjlMcBGYEqx1/jXZZwEvUIold32cu5IiZEydku0uVpPmZ8OH2DljwHgfv9ef\nl3TnluGdPrUsUPT8wD9/Kkdq+3cowXqJPoH62mMkDcPTG0oelDFUjDjmEQ0h927Y\nyt1KfrFnUl4sm+rkzmrj63z4FjcKc2ch4DM1wkyYQQKBgQDh1ZpHD8V3jq9KxmRH\n2NynBQmn88WhYhlzQS5goO1ZOj0fIuPO0nqEpwQ7op1e9l+WqDlgCfMftks+iM51\nOWLF+ZZvMcZ58Id0U3aRBVvisHEQxXavhafmHrqajBPRHYqBh9KQ6u5MRkAlrNy1\nVRBMCWtkiB6aUEy+CF69Bpb8iwKBgQC7FDqZqShshIuqN+njQufim8b9F0Fbqiiw\nYkyvvtQtjD/1jA1nHSrjqHA6Ao1zj/EfWruVkpfZ8bXSbBO87UbSQfxLRsmreCIQ\nwMGTjjgOfOXyJFbDpHZCJl6s5z1au8DcE0sfABbIcHAxvg7Nya/zqSIOuY3KByuM\nR2uIx/s7YQKBgGdl2ysqB2lEBPIhf4x9uBkob1FchWHsfmaMs2U+iS1PQujcmpz5\nNWtC5OdA/viZqQ5bm1ljdNNSLYVGMfDuA1FNgxkKGyt9eydBh4nCgF18F2hsYHjg\nowzziNB1ziTyd5Xyz+/WAKEfkQMu8CZ9+eY2cdsnj4trtJdVUbsOJ1cdAoGAGjpH\nzOsuQ6iBfCfCnp3urJJyX2E3RIailbfyUGFMleYnwWEVL/Oi46/lq/xXoG/5ug+a\nZOncaC2+8/U6/y201B10JYmTFHsPK5IakXlK2p0gD8aQc3VHLxb6BvuUWnggHbqG\nuZ3lk8xPrmma4bb4+AwqPi49dqlyrYQFy3NeAYECgYAHBqzZ66zrl6NSbrB4iPlW\n1X73Js+wn2rzyO2wshun8jEr2jHo1U+kyJbqLXe6gsiA1rsNp5wKS1Vg96evqoWR\ngrBny37jPlTMPFgRR1jRZa7JZLB5mYt+/y2RgdUz+n3u4eibl0XwSIty8HMPQA54\noqA8zF1PoeN5kTeiAy3ahA==\n-----END PRIVATE KEY-----\n',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
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