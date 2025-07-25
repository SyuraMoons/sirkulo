import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Payment, Refund } from '../models/payment.model';
import { Order } from '../models/order.model';
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
// TODO: Re-enable when Xendit API is updated
// import config from '../config';
// import { Xendit } from 'xendit-node';

/**
 * Payment Service for handling Xendit integration
 */
export class PaymentService {
  private paymentRepository: Repository<Payment>;
  private refundRepository: Repository<Refund>;
  private orderRepository: Repository<Order>;


  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
    this.refundRepository = AppDataSource.getRepository(Refund);
    this.orderRepository = AppDataSource.getRepository(Order);
    
    // TODO: Initialize Xendit client when API is updated
    // this._xenditClient = new Xendit({
    //   secretKey: config.payment.xenditSecretKey
    // });
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
          // TODO: Implement proper Xendit Invoice API call
          // The Xendit API structure has changed, need to update to current API
          throw new Error('Invoice creation not implemented - Xendit API needs update');
          // xenditResponse = await this.xenditClient.Invoice.createInvoice({
            // external_id: `order_${order.id}_${Date.now()}`, // TODO: Check correct property name for Xendit API
            // amount: order.totalAmount,  // This property doesn't exist in current Xendit API
            // description: invoiceDto.description,  // This property doesn't exist in current Xendit API
            // payerEmail: customer.email,  // This property doesn't exist in current Xendit API
            // customer: {
            //   given_names: customer.givenNames,
            //   surname: customer.surname,
            //   email: customer.email,
            //   mobile_number: customer.mobileNumber
            // },  // This property doesn't exist in current Xendit API
            // customerNotificationPreference: {
            //   invoice_created: ['email'],
            //   invoice_reminder: ['email'],
            //   invoice_paid: ['email']
            // },  // This property doesn't exist in current Xendit API
            // invoiceDuration: invoiceDto.invoiceDuration,  // This property doesn't exist in current Xendit API
            // successRedirectURL: invoiceDto.successRedirectUrl,  // This property doesn't exist in current Xendit API
            // failureRedirectURL: invoiceDto.failureRedirectUrl,  // This property doesn't exist in current Xendit API
            // currency: 'IDR',  // This property doesn't exist in current Xendit API
            // items: invoiceDto.items?.map(item => ({
            //   name: item.name,
            //   quantity: item.quantity,
            //   price: item.price,
            //   category: item.category,
            //   url: item.url
            // }))  // This property doesn't exist in current Xendit API
          // });
          // paymentUrl = xenditResponse.invoice_url;
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Payment creation failed: ${errorMessage}`);
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
      // Note: Xendit API structure may have changed, implement proper API call
      const xenditRefund = await this.createXenditRefund(payment.xenditPaymentId!, amount, reason);

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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Refund creation failed: ${errorMessage}`);
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

  private async createVirtualAccount(_order: Order, _customer: any, _bankCode?: XenditBankCode) {
    // TODO: Implement proper Xendit Virtual Account API call
    // The Xendit API structure has changed, need to update to current API
    throw new Error('Virtual Account creation not implemented - Xendit API needs update');
  }

  private async createEwalletPayment(_order: Order, _customer: any, _ewalletType?: XenditEwalletType) {
    // TODO: Implement proper Xendit EWallet API call
    // The Xendit API structure has changed, need to update to current API
    throw new Error('EWallet payment creation not implemented - Xendit API needs update');
  }

  private async createRetailOutletPayment(_order: Order, _customer: any, _retailOutletName?: string) {
    // TODO: Implement proper Xendit Retail Outlet API call
    // The Xendit API structure has changed, need to update to current API
    throw new Error('Retail Outlet payment creation not implemented - Xendit API needs update');
  }

  private async createXenditRefund(_paymentId: string, _amount: number, _reason: string): Promise<any> {
    // TODO: Implement proper Xendit refund API call
    // The Xendit API structure has changed, need to update to current API
    throw new Error('Xendit refund creation not implemented - Xendit API needs update');
  }

  private verifyWebhookSignature(_webhookData: any): boolean {
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