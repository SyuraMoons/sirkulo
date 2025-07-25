/**
 * Email service configuration and interfaces
 */

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  from: {
    email: string;
    name: string;
  };
  templates: {
    verification: string;
    passwordReset: string;
    orderConfirmation: string;
    paymentConfirmation: string;
    orderStatusUpdate: string;
    welcomeEmail: string;
  };
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, any>;
}

export interface EmailVerificationData {
  firstName: string;
  verificationUrl: string;
  companyName: string;
}

export interface PasswordResetData {
  firstName: string;
  resetUrl: string;
  expiryTime: string;
}

export interface OrderConfirmationData {
  firstName: string;
  orderNumber: string;
  orderItems: Array<{
    title: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  estimatedDelivery: string;
}

export interface PaymentConfirmationData {
  firstName: string;
  orderNumber: string;
  paymentAmount: number;
  paymentMethod: string;
  paidAt: string;
}

export interface OrderStatusUpdateData {
  firstName: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}