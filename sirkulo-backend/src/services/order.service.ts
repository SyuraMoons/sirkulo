import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Order } from '../models/order.model';
import { OrderStatus, PaymentStatus } from '../types/enums';
import { OrderItem } from '../models/order-item.model';
import { CartItem } from '../models/cart.model';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import { 
  CreateOrderDto, 
  OrderQueryDto, 
  UpdateOrderStatusDto, 
  CancelOrderDto,
  OrderListResponseDto,
  OrderStatsResponseDto
} from '../types/order.dto';

/**
 * Service for handling order operations
 */
export class OrderService {
  private orderRepository: Repository<Order>;
  private orderItemRepository: Repository<OrderItem>;
  private cartItemRepository: Repository<CartItem>;
  private listingRepository: Repository<Listing>;
  private userRepository: Repository<User>;

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order);
    this.orderItemRepository = AppDataSource.getRepository(OrderItem);
    this.cartItemRepository = AppDataSource.getRepository(CartItem);
    this.listingRepository = AppDataSource.getRepository(Listing);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create order from user's cart
   */
  async createOrderFromCart(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get user's cart items with relations
      const cartItems = await this.cartItemRepository.find({
        where: { userId },
        relations: ['listing', 'listing.business']
      });

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate cart items and check availability
      await this.validateCartForOrder(cartItems);

      // Group cart items by seller (business)
      const itemsBySeller = this.groupCartItemsBySeller(cartItems);

      const orders: Order[] = [];

      // Create separate orders for each seller
      for (const [sellerId, sellerItems] of itemsBySeller.entries()) {
        const seller = sellerItems[0].listing.business;
        const buyer = await this.userRepository.findOne({ where: { id: userId } });

        if (!buyer) {
          throw new Error('Buyer not found');
        }

        // Calculate totals
        const subtotal = sellerItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const shippingCost = this.calculateShippingCost(sellerItems, createOrderDto.shippingAddress);
        const taxAmount = this.calculateTax(subtotal);
        const totalAmount = subtotal + shippingCost + taxAmount;

        // Create order
        const order = this.orderRepository.create({
          orderNumber: Order.generateOrderNumber(),
          buyerId: userId,
          buyer,
          sellerId: Number(sellerId),
          seller,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          shippingCost,
          taxAmount,
          totalAmount,
          shippingAddress: createOrderDto.shippingAddress,
          paymentMethod: createOrderDto.paymentMethod,
          notes: createOrderDto.notes
        });

        const savedOrder = await queryRunner.manager.save(order);

        // Create order items
        const orderItems: OrderItem[] = [];
        for (const cartItem of sellerItems) {
          const orderItem = this.orderItemRepository.create(
            OrderItem.fromCartItem(cartItem, savedOrder)
          );
          orderItems.push(orderItem);
        }

        await queryRunner.manager.save(orderItems);
        savedOrder.items = orderItems;

        // Update listing quantities
        await this.updateListingQuantities(queryRunner.manager, sellerItems);

        orders.push(savedOrder);
      }

      // Clear user's cart
      await queryRunner.manager.delete(CartItem, { userId });

      await queryRunner.commitTransaction();

      // Return the first order (or combine if multiple sellers)
      // For now, we'll return the first order - you might want to return all orders
      return orders[0];

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get orders with filtering and pagination
   */
  async getOrders(queryDto: OrderQueryDto): Promise<OrderListResponseDto> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.listing', 'listing');

    // Apply filters
    if (queryDto.status) {
      queryBuilder.andWhere('order.status = :status', { status: queryDto.status });
    }

    if (queryDto.paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { 
        paymentStatus: queryDto.paymentStatus 
      });
    }

    if (queryDto.orderNumber) {
      queryBuilder.andWhere('order.orderNumber ILIKE :orderNumber', { 
        orderNumber: `%${queryDto.orderNumber}%` 
      });
    }

    if (queryDto.buyerId) {
      queryBuilder.andWhere('order.buyerId = :buyerId', { buyerId: queryDto.buyerId });
    }

    if (queryDto.sellerId) {
      queryBuilder.andWhere('order.sellerId = :sellerId', { sellerId: queryDto.sellerId });
    }

    // Apply sorting
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const orders = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map(order => order.toResponseObject() as any),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: number, userId?: number): Promise<Order> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.seller', 'seller')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.listing', 'listing')
      .where('order.id = :orderId', { orderId });

    // If userId provided, ensure user has access to this order
    if (userId) {
      queryBuilder.andWhere('(order.buyerId = :userId OR order.sellerId = :userId)', { userId });
    }

    const order = await queryBuilder.getOne();

    if (!order) {
      throw new Error('Order not found or access denied');
    }

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: number, 
    updateDto: UpdateOrderStatusDto, 
    userId: number
  ): Promise<Order> {
    const order = await this.getOrderById(orderId, userId);

    // Only seller can update order status (except cancellation)
    if (order.sellerId !== userId && updateDto.status !== OrderStatus.CANCELLED) {
      throw new Error('Only the seller can update order status');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, updateDto.status);

    // Update order
    order.status = updateDto.status;
    if (updateDto.notes) {
      order.notes = updateDto.notes;
    }
    if (updateDto.trackingNumber) {
      order.trackingNumber = updateDto.trackingNumber;
    }

    // Set appropriate timestamps
    const now = new Date();
    switch (updateDto.status) {
      case OrderStatus.CONFIRMED:
        order.confirmedAt = now;
        break;
      case OrderStatus.SHIPPED:
        order.shippedAt = now;
        break;
      case OrderStatus.DELIVERED:
        order.deliveredAt = now;
        break;
      case OrderStatus.CANCELLED:
        order.cancelledAt = now;
        break;
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: number, cancelDto: CancelOrderDto, userId: number): Promise<Order> {
    const order = await this.getOrderById(orderId, userId);

    if (!order.canBeCancelled()) {
      throw new Error('Order cannot be cancelled in its current status');
    }

    // Both buyer and seller can cancel
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new Error('Access denied');
    }

    order.status = OrderStatus.CANCELLED;
    order.cancellationReason = cancelDto.reason;
    order.cancelledAt = new Date();
    if (cancelDto.notes) {
      order.notes = cancelDto.notes;
    }

    // TODO: Restore listing quantities if needed
    await this.restoreListingQuantities(order);

    return await this.orderRepository.save(order);
  }

  /**
   * Get order statistics for a user
   */
  async getOrderStats(userId: number, role: 'buyer' | 'seller'): Promise<OrderStatsResponseDto> {
    const whereCondition = role === 'buyer' ? { buyerId: userId } : { sellerId: userId };

    const [orders, totalOrders] = await this.orderRepository.findAndCount({
      where: whereCondition
    });

    const stats = orders.reduce((acc, order) => {
      acc.totalRevenue += order.totalAmount;
      
      switch (order.status) {
        case OrderStatus.PENDING:
          acc.pendingOrders++;
          break;
        case OrderStatus.CONFIRMED:
          acc.confirmedOrders++;
          break;
        case OrderStatus.SHIPPED:
          acc.shippedOrders++;
          break;
        case OrderStatus.DELIVERED:
          acc.deliveredOrders++;
          break;
        case OrderStatus.CANCELLED:
          acc.cancelledOrders++;
          break;
      }

      return acc;
    }, {
      totalRevenue: 0,
      pendingOrders: 0,
      confirmedOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0
    });

    return {
      totalOrders,
      ...stats,
      averageOrderValue: totalOrders > 0 ? stats.totalRevenue / totalOrders : 0
    };
  }

  /**
   * Private helper methods
   */

  private async validateCartForOrder(cartItems: CartItem[]): Promise<void> {
    for (const cartItem of cartItems) {
      // Check if listing is still active
      if (cartItem.listing.status !== 'active') {
        throw new Error(`Listing "${cartItem.listing.title}" is no longer available`);
      }

      // Check if enough quantity is available
      if (cartItem.listing.quantity < cartItem.quantity) {
        throw new Error(`Insufficient quantity for "${cartItem.listing.title}"`);
      }
    }
  }

  private groupCartItemsBySeller(cartItems: CartItem[]): Map<string, CartItem[]> {
    return cartItems.reduce((groups, item) => {
      const sellerId = item.listing.businessId.toString();
      if (!groups.has(sellerId)) {
        groups.set(sellerId, []);
      }
      groups.get(sellerId)!.push(item);
      return groups;
    }, new Map<string, CartItem[]>());
  }

  private calculateShippingCost(items: CartItem[], _address: any): number {
    // Simple shipping calculation - you can make this more sophisticated
    const totalWeight = items.reduce((sum, item) => sum + item.quantity, 0);
    return Math.ceil(totalWeight / 100) * 50000; // ₹50,000 per 100kg
  }

  private calculateTax(subtotal: number): number {
    // Simple tax calculation (10%)
    return subtotal * 0.1;
  }

  private async updateListingQuantities(manager: any, cartItems: CartItem[]): Promise<void> {
    for (const cartItem of cartItems) {
      await manager.decrement(
        Listing,
        { id: cartItem.listingId },
        'quantity',
        cartItem.quantity
      );
    }
  }

  private async restoreListingQuantities(order: Order): Promise<void> {
    for (const item of order.items) {
      await this.listingRepository.increment(
        { id: item.listingId },
        'quantity',
        item.quantity
      );
    }
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}
