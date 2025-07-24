import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validation.middleware';
import { 
  CreateOrderDto, 
  UpdateOrderStatusDto, 
  CancelOrderDto 
} from '../types/order.dto';

const router = Router();
const orderController = new OrderController();

/**
 * All order routes require authentication
 */
router.use(authenticateToken);

/**
 * @route   POST /api/orders
 * @desc    Create order from cart
 * @access  Private (Authenticated users)
 */
router.post(
  '/',
  validateDto(CreateOrderDto),
  orderController.createOrder
);

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics for current user
 * @access  Private (Authenticated users)
 */
router.get('/stats', orderController.getOrderStats);

/**
 * @route   GET /api/orders/purchases
 * @desc    Get buyer orders (purchases) for current user
 * @access  Private (Authenticated users)
 */
router.get('/purchases', orderController.getBuyerOrders);

/**
 * @route   GET /api/orders/sales
 * @desc    Get seller orders (sales) for current user
 * @access  Private (Authenticated users)
 */
router.get('/sales', orderController.getSellerOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private (Authenticated users - only own orders or admin)
 */
router.get('/:id', orderController.getOrderById);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Authenticated sellers and admins)
 */
router.put(
  '/:id/status',
  validateDto(UpdateOrderStatusDto),
  orderController.updateOrderStatus
);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (Authenticated users - buyers and sellers)
 */
router.post(
  '/:id/cancel',
  validateDto(CancelOrderDto),
  orderController.cancelOrder
);

/**
 * @route   GET /api/orders
 * @desc    Get orders with filtering and pagination
 * @access  Private (Authenticated users)
 * @note    This route must be last to avoid conflicts with other routes
 */
router.get('/', orderController.getOrders);

export { router as orderRoutes };
