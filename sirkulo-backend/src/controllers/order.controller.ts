import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { ResponseUtil } from '../utils/response.util';
import { 
  CreateOrderDto, 
  OrderQueryDto, 
  UpdateOrderStatusDto, 
  CancelOrderDto 
} from '../types/order.dto';
import { AuthenticatedRequest } from '../types/auth.dto';
import { UserRole } from '../types';

/**
 * Controller for handling order operations
 */
export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  /**
   * Create order from cart
   * POST /api/orders
   */
  createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const createOrderDto: CreateOrderDto = req.body;

      const order = await this.orderService.createOrderFromCart(userId, createOrderDto);

      ResponseUtil.success(res, {
        message: 'Order created successfully',
        data: order.toResponseObject()
      }, 'Order created successfully', 201);
    } catch (error) {
      ResponseUtil.error(res, 
        error instanceof Error ? error.message : 'Failed to create order',
        400,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Get orders with filtering and pagination
   * GET /api/orders
   */
  getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRoles = req.user!.roles;
      const queryDto: OrderQueryDto = req.query as any;

      // If not admin, filter by user's orders
      if (!userRoles.includes(UserRole.ADMIN)) {
        // Determine if user is buyer or seller based on their active mode
        const activeMode = req.user!.activeMode;
        if (activeMode === UserRole.BUSINESS) {
          queryDto.sellerId = userId;
        } else {
          queryDto.buyerId = userId;
        }
      }

      const result = await this.orderService.getOrders(queryDto);

      ResponseUtil.success(res, {
        message: 'Orders retrieved successfully',
        data: result
      });
    } catch (error) {
      ResponseUtil.error(res, 
        'Failed to retrieve orders',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const userRoles = req.user!.roles;

      // Admin can see any order, others only their own
      const accessUserId = userRoles.includes(UserRole.ADMIN) ? undefined : userId;

      const order = await this.orderService.getOrderById(orderId, accessUserId);

      ResponseUtil.success(res, {
        message: 'Order retrieved successfully',
        data: order.toResponseObject()
      });
    } catch (error) {
      ResponseUtil.error(res, 
        error instanceof Error ? error.message : 'Failed to retrieve order',
        error instanceof Error && error.message.includes('not found') ? 404 : 400,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Update order status
   * PUT /api/orders/:id/status
   */
  updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const updateDto: UpdateOrderStatusDto = req.body;

      const order = await this.orderService.updateOrderStatus(orderId, updateDto, userId);

      ResponseUtil.success(res, {
        message: 'Order status updated successfully',
        data: order.toResponseObject()
      });
    } catch (error) {
      ResponseUtil.error(res, 
        error instanceof Error ? error.message : 'Failed to update order status',
        400,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Cancel order
   * POST /api/orders/:id/cancel
   */
  cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user!.userId;
      const cancelDto: CancelOrderDto = req.body;

      const order = await this.orderService.cancelOrder(orderId, cancelDto, userId);

      ResponseUtil.success(res, {
        message: 'Order cancelled successfully',
        data: order.toResponseObject()
      });
    } catch (error) {
      ResponseUtil.error(res, 
        error instanceof Error ? error.message : 'Failed to cancel order',
        400,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Get order statistics
   * GET /api/orders/stats
   */
  getOrderStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const activeMode = req.user!.activeMode;
      
      // Determine role based on active mode
      const role = activeMode === UserRole.BUSINESS ? 'seller' : 'buyer';

      const stats = await this.orderService.getOrderStats(userId, role);

      ResponseUtil.success(res, {
        message: 'Order statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      ResponseUtil.error(res, 
        'Failed to retrieve order statistics',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Get buyer orders (for recyclers/users)
   * GET /api/orders/purchases
   */
  getBuyerOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const queryDto: OrderQueryDto = { ...req.query, buyerId: userId } as any;

      const result = await this.orderService.getOrders(queryDto);

      ResponseUtil.success(res, {
        message: 'Purchase orders retrieved successfully',
        data: result
      });
    } catch (error) {
      ResponseUtil.error(res, 
        'Failed to retrieve purchase orders',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };

  /**
   * Get seller orders (for businesses)
   * GET /api/orders/sales
   */
  getSellerOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const queryDto: OrderQueryDto = { ...req.query, sellerId: userId } as any;

      const result = await this.orderService.getOrders(queryDto);

      ResponseUtil.success(res, {
        message: 'Sales orders retrieved successfully',
        data: result
      });
    } catch (error) {
      ResponseUtil.error(res, 
        'Failed to retrieve sales orders',
        500,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  };
}
