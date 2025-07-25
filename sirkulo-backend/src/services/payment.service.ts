import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Payment, Refund } from '../models/payment.model';
import { Order } from '../models/order.model';
import { User } from '../models/user.model';
import {
  CreateInvoiceDto,
  CreatePaymentDto,
  CreateRefundDto,
  PaymentQueryDto,
  XenditWebhookDto,
  XenditPaymentMethod,
  XenditPaymentStatus,
  XenditBankCode,
  XenditEwalletType
} from '../types/payment.dto';
import { OrderStatus, PaymentStatus } from '../types/enums';
import config from '../config';
import { Xendit } from 'xendit-node';

/**
 * Payment Service for handling Xendit integration
 */
export class PaymentService {
  private paymentRepository: Repository<Payment>;
  private refundRepository: Repository<Refund>;
  private orderRepository: Repository<Order>;
  private userRepository: Repository<User>;
  private xenditClient: Xendit;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.refundRepository = AppDataSource.getRepository(Refund);
    this.orderRepository = AppDataSource.getRepository(Order);
    this.userRepository = AppDataSource.getRepository(User);
    
    // Initialize Xendit client
    this.xenditClient = new Xendit({
      secretKey: config.payment.xenditSecretKey
    });
  }

  /**
   * Create payment for an order
   */
  async createPayment(createPaymentDto: CreatePaymentDto, userId: number): Promise<Payment> {
    const { orderId, paymentMethod, bankCode, ewalletType, retailOutletName, customer } = createPaymentDto;

    // Get order and validate ownership
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['buyer', 'seller', 'items']
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.buyerId !== userId) {
      throw new Error('Unauthorized: You can only pay for your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order is not in a payable state');
    }

    // Check if payment already exists
    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId, status: XenditPaymentStatus.PENDING }
    });

    if (existingPayment) {
      throw new Error('Pending payment already exists for this order');
    }

    // Create invoice with Xendit
    const invoiceDto: CreateInvoiceDto = {
      amount: order.totalAmount,
      description: `Payment for Order ${order.orderNumber}`,
      customer: customer,
      currency: 'IDR',
      invoiceDuration: 86400, // 24 hours
      successRedirectUrl: createPaymentDto.successRedirectUrl,
      failureRedirectUrl: createPaymentDto.failureRedirectUrl,
      items: order.items.map(item => ({
        name: item.listing?.title || 'Order Item',
        quantity: item.quantity,
        price: item.unitPrice,
        category: item.listing?.wasteType || 'waste'
      }))
    };

    let xenditResponse: any;
    let paymentUrl: string | undefined;
    let qrString: string | undefined;
    let virtualAccountNumber: string | undefined;
    let retailOutletCode: string | undefined;

    try {
      switch (paymentMethod) {
        case XenditPaymentMethod.BANK_TRANSFER:
        case XenditPaymentMethod.VIRTUAL_ACCOUNT:
          xenditResponse = await this.createVirtualAccount(order, customer, bankCode);
          virtualAccountNumber = xenditResponse.account_number;
          break;

        case XenditPaymentMethod.EWALLET:
          xenditResponse = await this.createEwalletPayment(order, customer, ewalletType);
          paymentUrl = xenditResponse.actions?.mobile_web_checkout_url;
          qrString = xenditResponse.actions?.qr_checkout_string;
          break;

        case XenditPaymentMethod.RETAIL_OUTLET:
          xenditResponse = await this.createRetailOutletPayment(order, customer, retailOutletName);
          retailOutletCode = xenditResponse.retail_outlet_name;
          break;

        default:
          // Create generic invoice
          xenditResponse = await this.xenditClient.Invoice.createInvoice({
            externalID: `order_${order.id}_${Date.now()}`,
            amount: order.totalAmount,
            description: invoiceDto.description,
            payerEmail: customer.email,
            customer: {
              given_names: customer.givenNames,
              surname: customer.surname,
              email: customer.email,
              mobile_number: customer.mobileNumber
            },
            customerNotificationPreference: {
              invoice_created: ['email'],
              invoice_reminder: ['email'],
              invoice_paid: ['email']
            },
            invoiceDuration: invoiceDto.invoiceDuration,
            successRedirectURL: invoiceDto.successRedirectUrl,
            failureRedirectURL: invoiceDto.failureRedirectUrl,
            currency: 'IDR',
            items: invoiceDto.items?.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              category: item.category,
              url: item.url
            }))
          });
          paymentUrl = xenditResponse.invoice_url;
          break;
      }

      // Create payment record
      const payment = this.paymentRepository.create({
        orderId: order.id,
        userId: userId,
        amount: order.totalAmount,
        currency: 'IDR',
        status: XenditPaymentStatus.PENDING,
        paymentMethod: paymentMethod,
        xenditInvoiceId: xenditResponse.id,
        paymentUrl: paymentUrl,
        qrString: qrString,
        virtualAccountNumber: virtualAccountNumber,
        retailOutletCode: retailOutletCode,
        bankCode: bankCode,
        ewalletType: ewalletType,
        customerInfo: {
          givenNames: customer.givenNames,
          surname: customer.surname,
          email: customer.email,
          mobileNumber: customer.mobileNumber
        },
        expiryDate: new Date(Date.now() + (invoiceDto.invoiceDuration || 86400) * 1000),
        xenditResponse: xenditResponse
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // Update order payment status
      order.paymentStatus = PaymentStatus.PENDING;
      await this.orderRepository.save(order);

      return savedPayment;

    } catch (error) {
      console.error('Xendit payment creation error:', error);
      throw new Error(`Payment creation failed: ${error.message}`);
    }
  }

  /**
   * Handle Xendit webhook
   */
  async handleWebhook(webhookData: XenditWebhookDto): Promise<void> {
    try {
      // Verify webhook signature (implement based on Xendit documentation)
      if (!this.verifyWebhookSignature(webhookData)) {
        throw new Error('Invalid webhook signature');
      }

      // Find payment by external ID or invoice ID
      const payment = await this.paymentRepository.findOne({
        where: [
          { xenditInvoiceId: webhookData.id },
          { xenditPaymentId: webhookData.payment_id }
        ],
        relations: ['order']
      });

      if (!payment) {
        console.log(`Payment not found for webhook: ${webhookData.id}`);
        return;
      }

      // Update payment status
      const oldStatus = payment.status;
      payment.status = this.mapXenditStatus(webhookData.status);
      
      if (webhookData.paid_at) {
        payment.paidAt = new Date(webhookData.paid_at);
      }

      if (webhookData.payment_id) {
        payment.xenditPaymentId = webhookData.payment_id;
      }

      if (webhookData.payment_method) {
        payment.bankCode = webhookData.bank_code;
      }

      if (webhookData.failure_code) {
        payment.failureCode = webhookData.failure_code;
        payment.failureMessage = `Payment failed: ${webhookData.failure_code}`;
      }

      // Update xendit response
      payment.xenditResponse = { ...payment.xenditResponse, webhook: webhookData };

      await this.paymentRepository.save(payment);

      // Update order status based on payment status
      if (payment.status === XenditPaymentStatus.PAID && oldStatus !== XenditPaymentStatus.PAID) {
        await this.handleSuccessfulPayment(payment);
      } else if (payment.status === XenditPaymentStatus.FAILED || payment.status === XenditPaymentStatus.EXPIRED) {
        await this.handleFailedPayment(payment);
      }

    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  /**
   * Create refund for a payment
   */
  async createRefund(createRefundDto: CreateRefundDto, userId: number): Promise<Refund> {
    const { paymentId, amount, reason, notes } = createRefundDto;

    // Get payment and validate
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['order', 'refunds']
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Check authorization (order buyer or seller can request refund)
    if (payment.userId !== userId && payment.order.sellerId !== userId) {
      throw new Error('Unauthorized: You can only refund your own payments');
    }

    if (!payment.canBeRefunded()) {
      throw new Error('Payment cannot be refunded');
    }

    const refundableAmount = payment.getRefundableAmount();
    if (amount > refundableAmount) {
      throw new Error(`Refund amount exceeds refundable amount of ${refundableAmount}`);
    }

    try {
      // Create refund with Xendit
      const xenditRefund = await this.xenditClient.Payment.createRefund({
        paymentRequestId: payment.xenditPaymentId!,
        amount: amount,
        reason: reason
      });

      // Create refund record
      const refund = this.refundRepository.create({
        paymentId: payment.id,
        amount: amount,
        currency: payment.currency,
        status: 'PENDING',
        reason: reason,
        notes: notes,
        xenditRefundId: xenditRefund.id,
        xenditResponse: xenditRefund
      });

      const savedRefund = await this.refundRepository.save(refund);

      // Update order status if full refund
      if (amount === payment.amount) {
        payment.order.status = OrderStatus.REFUNDED;
        payment.order.paymentStatus = PaymentStatus.REFUNDED;
        await this.orderRepository.save(payment.order);
      }

      return savedRefund;

    } catch (error) {
      console.error('Xendit refund creation error:', error);
      throw new Error(`Refund creation failed: ${error.message}`);
    }
  }

  /**
   * Get payments with filtering
   */
  async getPayments(queryDto: PaymentQueryDto, userId?: number): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('payment.refunds', 'refunds')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller');

    // User-specific filtering
    if (userId) {
      queryBuilder.andWhere('payment.userId = :userId', { userId });
    }

    // Apply filters
    if (queryDto.orderId) {
      queryBuilder.andWhere('payment.orderId = :orderId', { orderId: queryDto.orderId });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('payment.status = :status', { status: queryDto.status });
    }

    if (queryDto.paymentMethod) {
      queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', { 
        paymentMethod: queryDto.paymentMethod 
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`payment.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const payments = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      payments,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string, userId?: number): Promise<Payment> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('payment.refunds', 'refunds')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .where('payment.id = :paymentId', { paymentId });

    if (userId) {
      queryBuilder.andWhere('(payment.userId = :userId OR order.sellerId = :userId)', { userId });
    }

    const payment = await queryBuilder.getOne();

    if (!payment) {
      throw new Error('Payment not found or access denied');
    }

    return payment;
  }

  /**
   * Private helper methods
   */

  private async createVirtualAccount(order: Order, customer: any, bankCode?: XenditBankCode) {
    return await this.xenditClient.VirtualAccount.createVirtualAccount({
      externalID: `order_${order.id}_${Date.now()}`,
      bankCode: bankCode || XenditBankCode.BCA,
      name: `${customer.givenNames} ${customer.surname || ''}`.trim(),
      expectedAmount: order.totalAmount,
      isClosed: true,
      expirationDate: new Date(Date.now() + 86400 * 1000).toISOString()
    });
  }

  private async createEwalletPayment(order: Order, customer: any, ewalletType?: XenditEwalletType) {
    return await this.xenditClient.EWallet.createEWalletCharge({
      referenceID: `order_${order.id}_${Date.now()}`,
      currency: 'IDR',
      amount: order.totalAmount,
      checkoutMethod: 'ONE_TIME_PAYMENT',
      channelCode: ewalletType || XenditEwalletType.OVO,
      channelProperties: {
        successRedirectURL: process.env.FRONTEND_URL + '/payment/success',
        failureRedirectURL: process.env.FRONTEND_URL + '/payment/failure'
      },
      customerID: customer.email,
      customer: {
        givenNames: customer.givenNames,
        surname: customer.surname,
        email: customer.email,
        mobileNumber: customer.mobileNumber
      }
    });
  }

  private async createRetailOutletPayment(order: Order, customer: any, retailOutletName?: string) {
    return await this.xenditClient.RetailOutlet.createFixedPaymentCode({
      externalID: `order_${order.id}_${Date.now()}`,
      retailOutletName: retailOutletName || 'ALFAMART',
      name: `${customer.givenNames} ${customer.surname || ''}`.trim(),
      expectedAmount: order.totalAmount,
      paymentCode: `PAY${order.id}${Date.now().toString().slice(-6)}`,
      expirationDate: new Date(Date.now() + 86400 * 1000).toISOString()
    });
  }

  private verifyWebhookSignature(webhookData: any): boolean {
    // Implement Xendit webhook signature verification
    // This is a placeholder - implement according to Xendit documentation
    return true;
  }

  private mapXenditStatus(xenditStatus: string): XenditPaymentStatus {
    switch (xenditStatus.toUpperCase()) {
      case 'PAID':
      case 'SETTLED':
        return XenditPaymentStatus.PAID;
      case 'PENDING':
        return XenditPaymentStatus.PENDING;
      case 'EXPIRED':
        return XenditPaymentStatus.EXPIRED;
      case 'FAILED':
        return XenditPaymentStatus.FAILED;
      default:
        return XenditPaymentStatus.PENDING;
    }
  }

  private async handleSuccessfulPayment(payment: Payment): Promise<void> {
    // Update order status
    payment.order.status = OrderStatus.CONFIRMED;
    payment.order.paymentStatus = PaymentStatus.PAID;
    payment.order.confirmedAt = new Date();
    
    await this.orderRepository.save(payment.order);

    // TODO: Send payment confirmation notification
    console.log(`Payment confirmed for order ${payment.order.orderNumber}`);
  }

  private async handleFailedPayment(payment: Payment): Promise<void> {
    // Update order status
    payment.order.paymentStatus = PaymentStatus.FAILED;
    
    await this.orderRepository.save(payment.order);

    // TODO: Send payment failure notification
    console.log(`Payment failed for order ${payment.order.orderNumber}`);
  }
}