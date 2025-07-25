import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { body, param } from 'express-validator';
import { XenditPaymentMethod, XenditBankCode, XenditEwalletType } from '../types/payment.dto';

const router = Router();
const paymentController = new PaymentController();

/**
 * Validation middleware for creating payment
 */
const validateCreatePayment = [
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  
  body('paymentMethod')
    .isIn(Object.values(XenditPaymentMethod))
    .withMessage('Invalid payment method'),
  
  body('bankCode')
    .optional()
    .isIn(Object.values(XenditBankCode))
    .withMessage('Invalid bank code'),
  
  body('ewalletType')
    .optional()
    .isIn(Object.values(XenditEwalletType))
    .withMessage('Invalid e-wallet type'),
  
  body('retailOutletName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Retail outlet name must be between 1 and 50 characters'),
  
  body('customer.givenNames')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Given names must be between 1 and 50 characters'),
  
  body('customer.surname')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('Surname must be less than 50 characters'),
  
  body('customer.email')
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('customer.mobileNumber')
    .optional()
    .isMobilePhone('id-ID')
    .withMessage('Invalid Indonesian mobile number format'),
  
  body('successRedirectUrl')
    .optional()
    .isURL()
    .withMessage('Invalid success redirect URL'),
  
  body('failureRedirectUrl')
    .optional()
    .isURL()
    .withMessage('Invalid failure redirect URL')
];

/**
 * Validation middleware for creating refund
 */
const validateCreateRefund = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Refund amount must be greater than 0'),
  
  body('reason')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Refund reason must be between 1 and 500 characters'),
  
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

/**
 * Validation middleware for payment ID parameter
 */
const validatePaymentId = [
  param('id')
    .isUUID()
    .withMessage('Invalid payment ID format')
];

/**
 * Payment Routes
 */

// Create payment for an order
router.post(
  '/',
  authenticateToken,
  validateCreatePayment,
  paymentController.createPayment
);

// Get payments with filtering and pagination
router.get(
  '/',
  authenticateToken,
  paymentController.getPayments
);

// Get payment statistics
router.get(
  '/stats',
  authenticateToken,
  paymentController.getPaymentStats
);

// Get supported payment methods
router.get(
  '/methods',
  paymentController.getPaymentMethods
);

// Handle Xendit webhook (no auth required)
router.post(
  '/webhook',
  paymentController.handleWebhook
);

// Get payment by ID
router.get(
  '/:id',
  authenticateToken,
  validatePaymentId,
  paymentController.getPaymentById
);

// Create refund for a payment
router.post(
  '/:id/refund',
  authenticateToken,
  validatePaymentId,
  validateCreateRefund,
  paymentController.createRefund
);

export { router as paymentRoutes };