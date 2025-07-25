import { PaymentService } from '../services/payment.service';
import { AppDataSource } from '../config/database';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import { Payment, Refund } from '../models/payment.model';
import { CartItem } from '../models/cart.model';
import { Listing } from '../models/listing.model';
import {
  CreatePaymentDto,
  CreateRefundDto,
  XenditPaymentMethod,
  XenditBankCode,
  XenditPaymentStatus
} from '../types/payment.dto';
import { OrderStatus, PaymentStatus, UserRole, WasteType, ListingStatus } from '../types/enums';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let testUser: User;
  let testBusiness: User;
  let testListing: Listing;
  let testOrder: Order;

  beforeAll(async () => {
    await AppDataSource.initialize();
    paymentService = new PaymentService();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await AppDataSource.getRepository(User).save({
      email: 'buyer@test.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'Buyer',
      roles: [UserRole.USER],
      activeMode: UserRole.USER,
      isActive: true,
      emailVerified: true
    });

    // Create test business
    testBusiness = await AppDataSource.getRepository(User).save({
      email: 'business@test.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'Business',
      roles: [UserRole.BUSINESS],
      activeMode: UserRole.BUSINESS,
      isActive: true,
      emailVerified: true
    });

    // Create test listing
    testListing = await AppDataSource.getRepository(Listing).save({
      title: 'Test Fabric Waste',
      description: 'High quality cotton fabric scraps',
      wasteType: WasteType.FABRIC_SCRAPS,
      quantity: 100,
      unit: 'kg',
      pricePerUnit: 15000,
      totalPrice: 1500000,
      isNegotiable: false,
      status: ListingStatus.ACTIVE,
      location: {
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Jakarta',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        country: 'Indonesia',
        postalCode: '12345'
      },
      businessId: testBusiness.id,
      isActive: true
    });

    // Create test order
    testOrder = await AppDataSource.getRepository(Order).save({
      orderNumber: 'TEST-ORDER-001',
      buyerId: testUser.id,
      sellerId: testBusiness.id,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      subtotal: 1500000,
      shippingCost: 50000,
      taxAmount: 150000,
      totalAmount: 1700000,
      shippingAddress: {
        address: 'Test Address',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        country: 'Indonesia'
      },
      paymentMethod: 'bank_transfer'
    });
  });

  afterEach(async () => {
    // Clean up test data
    await AppDataSource.getRepository(Refund).delete({});
    await AppDataSource.getRepository(Payment).delete({});
    await AppDataSource.getRepository(Order).delete({});
    await AppDataSource.getRepository(CartItem).delete({});
    await AppDataSource.getRepository(Listing).delete({});
    await AppDataSource.getRepository(User).delete({});
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: testOrder.id,
        paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
        bankCode: XenditBankCode.BCA,
        customer: {
          givenNames: 'Test',
          surname: 'Buyer',
          email: 'buyer@test.com',
          mobileNumber: '+6281234567890'
        }
      };

      // Mock Xendit API response
      jest.spyOn(paymentService['xenditClient'].VirtualAccount, 'createVirtualAccount')
        .mockResolvedValue({
          id: 'va_test_123',
          external_id: `order_${testOrder.id}_${Date.now()}`,
          bank_code: 'BCA',
          account_number: '8808123456789',
          name: 'Test Buyer',
          expected_amount: 1700000,
          is_closed: true,
          expiration_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'PENDING'
        });

      const payment = await paymentService.createPayment(createPaymentDto, testUser.id);

      expect(payment).toBeDefined();
      expect(payment.orderId).toBe(testOrder.id);
      expect(payment.userId).toBe(testUser.id);
      expect(payment.amount).toBe(1700000);
      expect(payment.status).toBe(XenditPaymentStatus.PENDING);
      expect(payment.paymentMethod).toBe(XenditPaymentMethod.VIRTUAL_ACCOUNT);
      expect(payment.virtualAccountNumber).toBe('8808123456789');
    });

    it('should throw error if order not found', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: 99999,
        paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
        customer: {
          givenNames: 'Test',
          email: 'test@test.com'
        }
      };

      await expect(paymentService.createPayment(createPaymentDto, testUser.id))
        .rejects.toThrow('Order not found');
    });

    it('should throw error if user is not the buyer', async () => {
      const createPaymentDto: CreatePaymentDto = {
        orderId: testOrder.id,
        paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
        customer: {
          givenNames: 'Test',
          email: 'test@test.com'
        }
      };

      await expect(paymentService.createPayment(createPaymentDto, testBusiness.id))
        .rejects.toThrow('Unauthorized: You can only pay for your own orders');
    });

    it('should throw error if order is not in pending status', async () => {
      // Update order status to confirmed
      testOrder.status = OrderStatus.CONFIRMED;
      await AppDataSource.getRepository(Order).save(testOrder);

      const createPaymentDto: CreatePaymentDto = {
        orderId: testOrder.id,
        paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
        customer: {
          givenNames: 'Test',
          email: 'test@test.com'
        }
      };

      await expect(paymentService.createPayment(createPaymentDto, testUser.id))
        .rejects.toThrow('Order is not in a payable state');
    });
  });

  describe('createRefund', () => {
    let testPayment: Payment;

    beforeEach(async () => {
      // Create a paid payment for refund tests
      testPayment = await AppDataSource.getRepository(Payment).save({
        orderId: testOrder.id,
        userId: testUser.id,
        amount: 1700000,
        currency: 'IDR',
        status: XenditPaymentStatus.PAID,
        paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
        xenditInvoiceId: 'inv_test_123',
        xenditPaymentId: 'pay_test_123',
        customerInfo: {
          givenNames: 'Test',
          surname: 'Buyer',
          email: 'buyer@test.com'
        },
        paidAt: new Date()
      });
    });

    it('should create a refund successfully', async () => {
      const createRefundDto: CreateRefundDto = {
        paymentId: testPayment.id,
        amount: 1700000,
        reason: 'Customer requested cancellation',
        notes: 'Full refund for cancelled order'
      };

      // Mock Xendit API response
      jest.spyOn(paymentService['xenditClient'].Payment, 'createRefund')
        .mockResolvedValue({
          id: 'refund_test_123',
          payment_request_id: 'pay_test_123',
          amount: 1700000,
          reason: 'Customer requested cancellation',
          status: 'PENDING',
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        });

      const refund = await paymentService.createRefund(createRefundDto, testUser.id);

      expect(refund).toBeDefined();
      expect(refund.paymentId).toBe(testPayment.id);
      expect(refund.amount).toBe(1700000);
      expect(refund.reason).toBe('Customer requested cancellation');
      expect(refund.status).toBe('PENDING');
      expect(refund.xenditRefundId).toBe('refund_test_123');
    });

    it('should throw error if payment not found', async () => {
      const createRefundDto: CreateRefundDto = {
        paymentId: 'invalid-payment-id',
        amount: 1700000,
        reason: 'Test refund'
      };

      await expect(paymentService.createRefund(createRefundDto, testUser.id))
        .rejects.toThrow('Payment not found');
    });

    it('should throw error if refund amount exceeds refundable amount', async () => {
      const createRefundDto: CreateRefundDto = {
        paymentId: testPayment.id,
        amount: 2000000, // More than payment amount
        reason: 'Test refund'
      };

      await expect(paymentService.createRefund(createRefundDto, testUser.id))
        .rejects.toThrow('Refund amount exceeds refundable amount');
    });
  });

  describe('getPayments', () => {
    it('should retrieve payments with pagination', async () => {
      // Create multiple test payments
      for (let i = 0; i < 5; i++) {
        await AppDataSource.getRepository(Payment).save({
          orderId: testOrder.id,
          userId: testUser.id,
          amount: 100000 * (i + 1),
          currency: 'IDR',
          status: XenditPaymentStatus.PENDING,
          paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
          customerInfo: {
            givenNames: 'Test',
            email: 'test@test.com'
          }
        });
      }

      const result = await paymentService.getPayments(
        { page: 1, limit: 3 },
        testUser.id
      );

      expect(result.payments).toHaveLength(3);
      expect(result.total).toBe(5);
      expect(result.totalPages).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(3);
    });

    it('should filter payments by status', async () => {
      // Create payments with different statuses
      await AppDataSource.getRepository(Payment).save({
        orderId: testOrder.id,
        userId: testUser.id,
        amount: 100000,
        currency: 'IDR',
        status: XenditPaymentStatus.PAID,
        paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
        customerInfo: { givenNames: 'Test', email: 'test@test.com' }
      });

      await AppDataSource.getRepository(Payment).save({
        orderId: testOrder.id,
        userId: testUser.id,
        amount: 200000,
        currency: 'IDR',
        status: XenditPaymentStatus.PENDING,
        paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
        customerInfo: { givenNames: 'Test', email: 'test@test.com' }
      });

      const result = await paymentService.getPayments(
        { status: XenditPaymentStatus.PAID },
        testUser.id
      );

      expect(result.payments).toHaveLength(1);
      expect(result.payments[0].status).toBe(XenditPaymentStatus.PAID);
    });
  });

  describe('handleWebhook', () => {
    let testPayment: Payment;

    beforeEach(async () => {
      testPayment = await AppDataSource.getRepository(Payment).save({
        orderId: testOrder.id,
        userId: testUser.id,
        amount: 1700000,
        currency: 'IDR',
        status: XenditPaymentStatus.PENDING,
        paymentMethod: XenditPaymentMethod.VIRTUAL_ACCOUNT,
        xenditInvoiceId: 'inv_test_123',
        customerInfo: {
          givenNames: 'Test',
          email: 'test@test.com'
        }
      });
    });

    it('should handle successful payment webhook', async () => {
      const webhookData = {
        id: 'inv_test_123',
        external_id: `order_${testOrder.id}`,
        status: 'PAID',
        amount: 1700000,
        paid_amount: '1700000',
        paid_at: new Date().toISOString(),
        payment_method: 'VIRTUAL_ACCOUNT',
        payment_channel: 'BCA',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        currency: 'IDR'
      };

      // Mock webhook signature verification
      jest.spyOn(paymentService as any, 'verifyWebhookSignature').mockReturnValue(true);

      await paymentService.handleWebhook(webhookData as any);

      // Verify payment status updated
      const updatedPayment = await AppDataSource.getRepository(Payment)
        .findOne({ where: { id: testPayment.id } });

      expect(updatedPayment?.status).toBe(XenditPaymentStatus.PAID);
      expect(updatedPayment?.paidAt).toBeDefined();

      // Verify order status updated
      const updatedOrder = await AppDataSource.getRepository(Order)
        .findOne({ where: { id: testOrder.id } });

      expect(updatedOrder?.status).toBe(OrderStatus.CONFIRMED);
      expect(updatedOrder?.paymentStatus).toBe(PaymentStatus.PAID);
    });

    it('should handle failed payment webhook', async () => {
      const webhookData = {
        id: 'inv_test_123',
        external_id: `order_${testOrder.id}`,
        status: 'FAILED',
        amount: 1700000,
        failure_code: 'PAYMENT_FAILED',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        currency: 'IDR'
      };

      // Mock webhook signature verification
      jest.spyOn(paymentService as any, 'verifyWebhookSignature').mockReturnValue(true);

      await paymentService.handleWebhook(webhookData as any);

      // Verify payment status updated
      const updatedPayment = await AppDataSource.getRepository(Payment)
        .findOne({ where: { id: testPayment.id } });

      expect(updatedPayment?.status).toBe(XenditPaymentStatus.FAILED);
      expect(updatedPayment?.failureCode).toBe('PAYMENT_FAILED');

      // Verify order status updated
      const updatedOrder = await AppDataSource.getRepository(Order)
        .findOne({ where: { id: testOrder.id } });

      expect(updatedOrder?.paymentStatus).toBe(PaymentStatus.FAILED);
    });
  });
});