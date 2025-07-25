import sgMail from '@sendgrid/mail';
import nodemailer, { Transporter } from 'nodemailer';
import { readFile } from 'fs/promises';
import { join } from 'path';
import config from '../config';
import {
  EmailConfig,
  SendEmailOptions,
  EmailVerificationData,
  PasswordResetData,
  OrderConfirmationData,
  PaymentConfirmationData,
  OrderStatusUpdateData
} from '../types/email.dto';

/**
 * Email Service for handling all email communications
 */
export class EmailService {
  private transporter?: Transporter;
  private emailConfig: EmailConfig;

  constructor() {
    this.emailConfig = this.getEmailConfig();
    this.initializeProviders();
  }

  /**
   * Initialize email providers
   */
  private initializeProviders(): void {
    // Initialize SendGrid
    if (config.email.sendgrid.apiKey) {
      sgMail.setApiKey(config.email.sendgrid.apiKey);
      console.log('✅ SendGrid initialized successfully');
    } else {
      console.warn('⚠️ SendGrid API key not configured');
    }

    // Fallback SMTP transporter (if needed)
    if (this.emailConfig.provider === 'smtp') {
      this.transporter = this.createTransporter();
    }
  }

  /**
   * Get email configuration from environment
   */
  private getEmailConfig(): EmailConfig {
    return {
      provider: 'sendgrid' as const,
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || ''
        }
      },
      sendgrid: {
        apiKey: config.email.sendgrid.apiKey,
        fromEmail: config.email.from.email,
        fromName: config.email.from.name
      },
      from: {
        email: config.email.from.email,
        name: config.email.from.name
      },
      templates: {
        verification: 'email-verification',
        passwordReset: 'password-reset',
        orderConfirmation: 'order-confirmation',
        paymentConfirmation: 'payment-confirmation',
        orderStatusUpdate: 'order-status-update',
        welcomeEmail: 'welcome-email'
      }
    };
  }

  /**
   * Create email transporter based on configuration
   */
  private createTransporter(): Transporter {
    if (this.emailConfig.provider === 'smtp') {
      return nodemailer.createTransporter({
        host: this.emailConfig.smtp!.host,
        port: this.emailConfig.smtp!.port,
        secure: this.emailConfig.smtp!.secure,
        auth: {
          user: this.emailConfig.smtp!.auth.user,
          pass: this.emailConfig.smtp!.auth.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }

    // Add other providers (SendGrid, etc.) here
    throw new Error(`Email provider ${this.emailConfig.provider} not implemented`);
  }

  /**
   * Send email with template
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      // Use SendGrid as primary provider
      if (config.email.sendgrid.apiKey) {
        return await this.sendWithSendGrid(options);
      }
      
      // Fallback to SMTP if configured
      if (this.transporter) {
        return await this.sendWithSMTP(options);
      }
      
      // Development mode - just log
      if (config.nodeEnv === 'development') {
        console.log('📧 [DEV MODE] Email would be sent:', {
          to: options.to,
          subject: options.subject,
          from: this.emailConfig.from
        });
        return true;
      }
      
      throw new Error('No email provider configured');
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send email using SendGrid
   */
  private async sendWithSendGrid(options: SendEmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from: {
          email: this.emailConfig.from.email,
          name: this.emailConfig.from.name,
        },
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html || ''),
        ...(options.cc && { cc: Array.isArray(options.cc) ? options.cc : [options.cc] }),
        ...(options.bcc && { bcc: Array.isArray(options.bcc) ? options.bcc : [options.bcc] }),
      };

      await sgMail.send(msg);
      console.log(`✅ Email sent via SendGrid to: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
      return true;
    } catch (error) {
      console.error('❌ SendGrid email failed:', error);
      throw error;
    }
  }

  /**
   * Send email using SMTP (fallback)
   */
  private async sendWithSMTP(options: SendEmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `${this.emailConfig.from.name} <${this.emailConfig.from.email}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      };

      const result = await this.transporter!.sendMail(mailOptions);
      console.log(`✅ Email sent via SMTP: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('❌ SMTP email failed:', error);
      throw error;
    }
  }

  /**
   * Load and render email template
   */
  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<{ html: string; text: string }> {
    try {
      const templatePath = join(__dirname, '../templates/email', templateName);
      
      // Load HTML template
      const htmlTemplate = await readFile(`${templatePath}.html`, 'utf-8');
      
      // Load text template (fallback to HTML if not exists)
      let textTemplate: string;
      try {
        textTemplate = await readFile(`${templatePath}.txt`, 'utf-8');
      } catch {
        textTemplate = htmlTemplate.replace(/<[^>]*>/g, ''); // Strip HTML tags
      }

      // Simple template engine (replace {{variable}} with data)
      const html = this.interpolateTemplate(htmlTemplate, data);
      const text = this.interpolateTemplate(textTemplate, data);

      return { html, text };
    } catch (error) {
      console.error(`Template rendering failed for ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found or rendering failed`);
    }
  }

  /**
   * Simple template interpolation
   */
  private interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email: string, data: EmailVerificationData): Promise<boolean> {
    try {
      const { html, text } = await this.renderTemplate(this.emailConfig.templates.verification, data);
      
      return await this.sendEmail({
        to: email,
        subject: 'Verify Your Sirkulo Account',
        html,
        text
      });
    } catch (error) {
      console.error('Verification email sending failed:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, data: PasswordResetData): Promise<boolean> {
    try {
      const { html, text } = await this.renderTemplate(this.emailConfig.templates.passwordReset, data);
      
      return await this.sendEmail({
        to: email,
        subject: 'Reset Your Sirkulo Password',
        html,
        text
      });
    } catch (error) {
      console.error('Password reset email sending failed:', error);
      return false;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(email: string, data: OrderConfirmationData): Promise<boolean> {
    try {
      const { html, text } = await this.renderTemplate(this.emailConfig.templates.orderConfirmation, data);
      
      return await this.sendEmail({
        to: email,
        subject: `Order Confirmation - ${data.orderNumber}`,
        html,
        text
      });
    } catch (error) {
      console.error('Order confirmation email sending failed:', error);
      return false;
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmationEmail(email: string, data: PaymentConfirmationData): Promise<boolean> {
    try {
      const { html, text } = await this.renderTemplate(this.emailConfig.templates.paymentConfirmation, data);
      
      return await this.sendEmail({
        to: email,
        subject: `Payment Confirmed - ${data.orderNumber}`,
        html,
        text
      });
    } catch (error) {
      console.error('Payment confirmation email sending failed:', error);
      return false;
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdateEmail(email: string, data: OrderStatusUpdateData): Promise<boolean> {
    try {
      const { html, text } = await this.renderTemplate(this.emailConfig.templates.orderStatusUpdate, data);
      
      return await this.sendEmail({
        to: email,
        subject: `Order Update - ${data.orderNumber}`,
        html,
        text
      });
    } catch (error) {
      console.error('Order status update email sending failed:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, data: { firstName: string; userType: string }): Promise<boolean> {
    try {
      const { html, text } = await this.renderTemplate(this.emailConfig.templates.welcomeEmail, data);
      
      return await this.sendEmail({
        to: email,
        subject: 'Welcome to Sirkulo!',
        html,
        text
      });
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      return false;
    }
  }

  /**
   * Send bulk emails (for newsletters, announcements)
   */
  async sendBulkEmail(
    recipients: string[], 
    subject: string, 
    templateName: string, 
    data: Record<string, any>
  ): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    
    const { html, text } = await this.renderTemplate(templateName, data);
    
    // Send emails in batches to avoid rate limiting
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        await this.sendEmail({
          bcc: batch, // Use BCC for bulk emails
          to: this.emailConfig.from.email, // Send to self with BCC
          subject,
          html,
          text
        });
        
        results.success += batch.length;
      } catch (error) {
        console.error(`Bulk email batch failed:`, error);
        results.failed += batch.length;
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      if (config.email.sendgrid.apiKey) {
        // Test SendGrid by sending a test email
        const testMsg = {
          to: this.emailConfig.from.email,
          from: {
            email: this.emailConfig.from.email,
            name: this.emailConfig.from.name,
          },
          subject: 'Sirkulo SendGrid Test',
          html: '<p>Your Sirkulo SendGrid email service is working correctly!</p>',
        };
        
        await sgMail.send(testMsg);
        console.log('✅ SendGrid configuration test passed');
        return true;
      } else if (this.transporter) {
        await this.transporter.verify();
        console.log('✅ SMTP configuration test passed');
        return true;
      } else {
        console.log('⚠️ No email provider configured');
        return false;
      }
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return false;
    }
  }

  /**
   * Queue email for later sending (useful for failed emails)
   */
  async queueEmail(options: SendEmailOptions, retryCount: number = 0): Promise<void> {
    // TODO: Implement email queue using Redis or database
    // For now, we'll just log it
    console.log(`Email queued for retry (attempt ${retryCount + 1}):`, {
      to: options.to,
      subject: options.subject
    });
  }
}