import { EmailService } from '../services/email.service';
import { AppDataSource } from '../config/database';
import { createTestUser } from './setup';

describe('EmailService', () => {
  let emailService: EmailService;

  beforeAll(async () => {
    emailService = new EmailService();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      const testUser = await createTestUser({
        email: 'test@example.com',
        firstName: 'John'
      });

      const verificationData = {
        firstName: testUser.firstName,
        verificationUrl: 'https://app.sirkulo.com/verify?token=test-token',
        companyName: 'Sirkulo'
      };

      const result = await emailService.sendVerificationEmail(
        testUser.email,
        verificationData
      );

      expect(result).toBe(true);
    });

    it('should handle email sending failure gracefully', async () => {
      // Mock transporter to fail
      jest.spyOn(emailService['transporter'], 'sendMail')
        .mockRejectedValueOnce(new Error('SMTP Error'));

      const verificationData = {
        firstName: 'Test',
        verificationUrl: 'https://app.sirkulo.com/verify?token=test-token',
        companyName: 'Sirkulo'
      };

      const result = await emailService.sendVerificationEmail(
        'test@example.com',
        verificationData
      );

      expect(result).toBe(false);
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const resetData = {
        firstName: 'John',
        resetUrl: 'https://app.sirkulo.com/reset?token=reset-token',
        expiryTime: '10 minutes'
      };

      const result = await emailService.sendPasswordResetEmail(
        'test@example.com',
        resetData
      );

      expect(result).toBe(true);
    });
  });

  describe('sendOrderConfirmationEmail', () => {
    it('should send order confirmation email successfully', async () => {
      const orderData = {
        firstName: 'John',
        orderNumber: 'ORD-2024-001',
        orderItems: [
          {
            title: 'Cotton Fabric Scraps',
            quantity: 10,
            price: 15000
          }
        ],
        totalAmount: 150000,
        shippingAddress: 'Jakarta, Indonesia',
        estimatedDelivery: '3-5 business days'
      };

      const result = await emailService.sendOrderConfirmationEmail(
        'test@example.com',
        orderData
      );

      expect(result).toBe(true);
    });
  });

  describe('sendPaymentConfirmationEmail', () => {
    it('should send payment confirmation email successfully', async () => {
      const paymentData = {
        firstName: 'John',
        orderNumber: 'ORD-2024-001',
        paymentAmount: 150000,
        paymentMethod: 'Virtual Account - BCA',
        paidAt: new Date().toISOString()
      };

      const result = await emailService.sendPaymentConfirmationEmail(
        'test@example.com',
        paymentData
      );

      expect(result).toBe(true);
    });
  });

  describe('sendOrderStatusUpdateEmail', () => {
    it('should send order status update email successfully', async () => {
      const statusData = {
        firstName: 'John',
        orderNumber: 'ORD-2024-001',
        oldStatus: 'CONFIRMED',
        newStatus: 'SHIPPED',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: '2 business days'
      };

      const result = await emailService.sendOrderStatusUpdateEmail(
        'test@example.com',
        statusData
      );

      expect(result).toBe(true);
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      const welcomeData = {
        firstName: 'John',
        userType: 'Business'
      };

      const result = await emailService.sendWelcomeEmail(
        'test@example.com',
        welcomeData
      );

      expect(result).toBe(true);
    });
  });

  describe('sendBulkEmail', () => {
    it('should send bulk emails successfully', async () => {
      const recipients = [
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
      ];

      const result = await emailService.sendBulkEmail(
        recipients,
        'Newsletter - Sirkulo Updates',
        'newsletter',
        {
          title: 'Monthly Newsletter',
          content: 'Latest updates from Sirkulo'
        }
      );

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
    });
  });

  describe('testEmailConfiguration', () => {
    it('should validate email configuration', async () => {
      const result = await emailService.testEmailConfiguration();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('template rendering', () => {
    it('should interpolate template variables correctly', async () => {
      const template = 'Hello {{name}}, welcome to {{company}}!';
      const data = { name: 'John', company: 'Sirkulo' };
      
      const result = emailService['interpolateTemplate'](template, data);
      
      expect(result).toBe('Hello John, welcome to Sirkulo!');
    });

    it('should leave unmatched variables unchanged', async () => {
      const template = 'Hello {{name}}, welcome to {{unknown}}!';
      const data = { name: 'John' };
      
      const result = emailService['interpolateTemplate'](template, data);
      
      expect(result).toBe('Hello John, welcome to {{unknown}}!');
    });
  });
});