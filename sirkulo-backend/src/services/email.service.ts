import nodemailer, { Transporter } from 'nodemailer';
import fs from 'fs';
import path from 'path';

/**
 * Email template types
 */
export type EmailTemplate = 'email-verification' | 'order-confirmation' | 'general-notification';

/**
 * Email service configuration
 */
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Template data interface
 */
interface TemplateData {
  [key: string]: any;
}

/**
 * Email service for Sirkulo marketplace
 * Handles transactional emails with template support
 */
export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  private constructor() {
    this.initializeTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    try {
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      };

      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.warn('⚠️ Email credentials not configured. Email service will be disabled.');
        return;
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;
      
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Send template-based email
   */
  public async sendTemplateEmail(
    to: string,
    template: EmailTemplate,
    data: TemplateData
  ): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️ Email service not configured. Cannot send email.');
      return false;
    }

    try {
      const { subject, html, text } = await this.renderTemplate(template, data);

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'Sirkulo'} <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Render email template
   */
  private async renderTemplate(
    template: EmailTemplate,
    data: TemplateData
  ): Promise<{ subject: string; html: string; text: string }> {
    const templatePath = path.join(__dirname, '../templates/email');
    
    try {
      // Read HTML template
      const htmlFile = path.join(templatePath, `${template}.html`);
      let html = '';
      
      if (fs.existsSync(htmlFile)) {
        html = fs.readFileSync(htmlFile, 'utf-8');
      } else {
        html = this.getDefaultTemplate();
      }

      // Read text template
      const textFile = path.join(templatePath, `${template}.txt`);
      let text = '';
      
      if (fs.existsSync(textFile)) {
        text = fs.readFileSync(textFile, 'utf-8');
      } else {
        text = this.getDefaultTextTemplate();
      }

      // Replace placeholders
      html = this.replacePlaceholders(html, data);
      text = this.replacePlaceholders(text, data);

      // Generate subject based on template
      const subject = this.generateSubject(template, data);

      return { subject, html, text };
    } catch (error) {
      console.error('❌ Failed to render email template:', error);
      return {
        subject: data.title || 'Notification from Sirkulo',
        html: this.getDefaultTemplate(),
        text: this.getDefaultTextTemplate(),
      };
    }
  }

  /**
   * Replace placeholders in template
   */
  private replacePlaceholders(template: string, data: TemplateData): string {
    let result = template;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, String(value));
    });

    return result;
  }

  /**
   * Generate email subject
   */
  private generateSubject(template: EmailTemplate, data: TemplateData): string {
    switch (template) {
      case 'email-verification':
        return 'Verify your Sirkulo account';
      case 'order-confirmation':
        return `Order confirmation - ${data.orderId || 'Your order'}`;
      case 'general-notification':
        return data.title || 'Notification from Sirkulo';
      default:
        return 'Notification from Sirkulo';
    }
  }

  /**
   * Default HTML template
   */
  private getDefaultTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>{{title}}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5aa0;">{{title}}</h1>
          <p>{{message}}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent by Sirkulo - Circular Economy Marketplace
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Default text template
   */
  private getDefaultTextTemplate(): string {
    return `
{{title}}

{{message}}

---
This email was sent by Sirkulo - Circular Economy Marketplace
    `;
  }

  /**
   * Verify email service configuration
   */
  public async verifyConfiguration(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Email service verification failed:', error);
      return false;
    }
  }
}

export default EmailService.getInstance();