import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import {
  CreatePaymentDto,
  CreateRefundDto,
  PaymentQueryDto,
  XenditWebhookDto
} from '../types/payment.dto';
import { successResponse, errorResponse } from '../utils/response.util';
import { validationResult } from 'express-validator';

/**
 * Payment Controller
 * Handles payment-related HTTP requests
 */
export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Create payment for an order
   * POST /api/payments
   */
  createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errorResponse('Validation failed', errors.array()));
        return;
      }

      const createPaymentDto: CreatePaymentDto = req.body;
      const userId = req.user!.userId;

      const payment = await this.paymentService.createPayment(createPaymentDto, userId);

      res.status(201).json(successResponse(
        'Payment created successfully',
        payment.toResponseObject()
      ));
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(400).json(errorResponse(error.message));
    }
  };

  /**
   * Get payments with filtering
   * GET /api/payments
   */
  getPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const queryDto: PaymentQueryDto = {
        orderId: req.query.orderId ? parseInt(req.query.orderId as string) : undefined,
        status: req.query.status as any,
        paymentMethod: req.query.paymentMethod as any,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const userId = req.user!.userId;
      const result = await this.paymentService.getPayments(queryDto, userId);

      res.status(200).json(successResponse(
        'Payments retrieved successfully',
        {
          payments: result.payments.map(p => p.toResponseObject()),
          meta: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasNextPage: result.page < result.totalPages,
            hasPreviousPage: result.page > 1
          }
        }
      ));
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json(errorResponse('Failed to retrieve payments'));
    }
  };

  /**
   * Get payment by ID
   * GET /api/payments/:id
   */
  getPaymentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const paymentId = req.params.id;
      const userId = req.user!.userId;

      const payment = await this.paymentService.getPaymentById(paymentId, userId);

      res.status(200).json(successResponse(
        'Payment retrieved successfully',
        payment.toResponseObject()
      ));
    } catch (error) {
      console.error('Get payment by ID error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json(errorResponse(error.message));
      } else {
        res.status(500).json(errorResponse('Failed to retrieve payment'));
      }
    }
  };

  /**
   * Create refund for a payment
   * POST /api/payments/:id/refund
   */
  createRefund = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(errorResponse('Validation failed', errors.array()));
        return;
      }

      const paymentId = req.params.id;
      const createRefundDto: CreateRefundDto = {
        ...req.body,
        paymentId
      };
      const userId = req.user!.userId;

      const refund = await this.paymentService.createRefund(createRefundDto, userId);

      res.status(201).json(successResponse(
        'Refund created successfully',
        refund.toResponseObject()
      ));
    } catch (error) {
      console.error('Create refund error:', error);
      if (error.message.includes('not found')) {
        res.status(404).json(errorResponse(error.message));
      } else if (error.message.includes('Unauthorized')) {
        res.status(403).json(errorResponse(error.message));
      } else {
        res.status(400).json(errorResponse(error.message));
      }
    }
  };

  /**
   * Handle Xendit webhook
   * POST /api/payments/webhook
   */
  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const webhookData: XenditWebhookDto = req.body;

      await this.paymentService.handleWebhook(webhookData);

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook handling error:', error);
      // Still return 200 to prevent Xendit from retrying
      res.status(200).json({ status: 'error', message: error.message });
    }
  };

  /**
   * Get payment statistics
   * GET /api/payments/stats
   */
  getPaymentStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      
      // Get user's payment statistics
      const queryDto: PaymentQueryDto = { limit: 1000 }; // Get all for stats
      const result = await this.paymentService.getPayments(queryDto, userId);

      const stats = result.payments.reduce((acc, payment) => {
        acc.totalTransactions++;
        acc.totalAmount += payment.amount;

        switch (payment.status) {
          case 'PENDING':
            acc.pendingPayments++;
            break;
          case 'PAID':
            acc.successfulPayments++;
            break;
          case 'FAILED':
            acc.failedPayments++;
            break;
          case 'EXPIRED':
            acc.expiredPayments++;
            break;
        }

        return acc;
      }, {
        totalTransactions: 0,
        totalAmount: 0,
        pendingPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        expiredPayments: 0
      });

      const successRate = stats.totalTransactions > 0 
        ? (stats.successfulPayments / stats.totalTransactions) * 100 
        : 0;

      const averageAmount = stats.totalTransactions > 0
        ? stats.totalAmount / stats.totalTransactions
        : 0;

      res.status(200).json(successResponse(
        'Payment statistics retrieved successfully',
        {
          ...stats,
          successRate: Math.round(successRate * 100) / 100,
          averageAmount: Math.round(averageAmount * 100) / 100
        }
      ));
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json(errorResponse('Failed to retrieve payment statistics'));
    }
  };

  /**
   * Get supported payment methods
   * GET /api/payments/methods
   */
  getPaymentMethods = async (req: Request, res: Response): Promise<void> => {
    try {
      const paymentMethods = {
        bankTransfer: {
          name: 'Bank Transfer',
          code: 'BANK_TRANSFER',
          description: 'Transfer via ATM, internet banking, or mobile banking',
          banks: [
            { code: 'BCA', name: 'Bank Central Asia', fee: 0 },
            { code: 'BNI', name: 'Bank Negara Indonesia', fee: 0 },
            { code: 'BRI', name: 'Bank Rakyat Indonesia', fee: 0 },
            { code: 'MANDIRI', name: 'Bank Mandiri', fee: 0 },
            { code: 'PERMATA', name: 'Bank Permata', fee: 0 },
            { code: 'BSI', name: 'Bank Syariah Indonesia', fee: 0 }
          ]
        },
        ewallet: {
          name: 'E-Wallet',
          code: 'EWALLET',
          description: 'Pay using your favorite e-wallet',
          providers: [
            { code: 'OVO', name: 'OVO', fee: 0 },
            { code: 'DANA', name: 'DANA', fee: 0 },
            { code: 'LINKAJA', name: 'LinkAja', fee: 0 },
            { code: 'SHOPEEPAY', name: 'ShopeePay', fee: 0 },
            { code: 'GOPAY', name: 'GoPay', fee: 0 }
          ]
        },
        retailOutlet: {
          name: 'Retail Outlet',
          code: 'RETAIL_OUTLET',
          description: 'Pay at convenience stores',
          outlets: [
            { code: 'ALFAMART', name: 'Alfamart', fee: 2500 },
            { code: 'INDOMARET', name: 'Indomaret', fee: 2500 }
          ]
        },
        virtualAccount: {
          name: 'Virtual Account',
          code: 'VIRTUAL_ACCOUNT',
          description: 'Get a unique account number for payment',
          banks: [
            { code: 'BCA', name: 'BCA Virtual Account', fee: 0 },
            { code: 'BNI', name: 'BNI Virtual Account', fee: 0 },
            { code: 'BRI', name: 'BRI Virtual Account', fee: 0 },
            { code: 'MANDIRI', name: 'Mandiri Virtual Account', fee: 0 }
          ]
        }
      };

      res.status(200).json(successResponse(
        'Payment methods retrieved successfully',
        paymentMethods
      ));
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json(errorResponse('Failed to retrieve payment methods'));
    }
  };
}