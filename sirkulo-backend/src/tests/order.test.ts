import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { DataSource } from 'typeorm';
import { initializeDatabase } from '../config/database';
import { OrderService } from '../services/order.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { ListingService } from '../services/listing.service';
import { OrderStatus, PaymentStatus } from '../types/enums';
import { CreateOrderDto } from '../types/order.dto';
import { UserRole } from '../types';

describe('Order Management System', () => {
  let dataSource: DataSource;
  let orderService: OrderService;
  let cartService: CartService;
  let authService: AuthService;
  let listingService: ListingService;
  
  let buyerUser: any;
  let sellerUser: any;
  let testListing: any;

  beforeAll(async () => {
    // Initialize test database
    dataSource = await initializeDatabase();
    orderService = new OrderService();
    cartService = new CartService();
    authService = new AuthService();
    listingService = new ListingService();
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Create test users
    buyerUser = await authService.signUp({
      email: 'buyer@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Buyer',
      roles: [UserRole.USER],
      activeMode: UserRole.USER
    });

    sellerUser = await authService.signUp({
      email: 'seller@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Seller',
      roles: [UserRole.BUSINESS],
      activeMode: UserRole.BUSINESS
    });

    // Create test listing
    testListing = await listingService.createListing(sellerUser.user.id, {
      title: 'Test Product',
      description: 'A test product for order testing',
      category: 'electronics',
      condition: 'good',
      price: 100000,
      quantity: 10,
      location: {
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Jakarta, Indonesia',
        city: 'Jakarta',
        country: 'Indonesia'
      }
    });

    // Add item to cart
    await cartService.addToCart(buyerUser.user.id, {
      listingId: testListing.id,
      quantity: 2
    });
  });

  describe('Order Creation', () => {
    it('should create order from cart successfully', async () => {
      const createOrderDto: CreateOrderDto = {
        shippingAddress: {
          fullName: 'Test Buyer',
          addressLine1: '123 Test Street',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          postalCode: '12345',
          country: 'Indonesia',
          phoneNumber: '+6281234567890'
        },
        paymentMethod: 'bank_transfer',
        notes: 'Test order'
      };

      const order = await orderService.createOrderFromCart(
        buyerUser.user.id,
        createOrderDto
      );

      expect(order).toBeDefined();
      expect(order.orderNumber).toMatch(/^ORD-\d{4}-\d+$/);
      expect(order.buyerId).toBe(buyerUser.user.id);
      expect(order.sellerId).toBe(sellerUser.user.id);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.paymentStatus).toBe(PaymentStatus.PENDING);
      expect(order.totalAmount).toBe(200000); // 2 items × 100,000
      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(2);
    });

    it('should clear cart after order creation', async () => {
      const createOrderDto: CreateOrderDto = {
        shippingAddress: {
          fullName: 'Test Buyer',
          addressLine1: '123 Test Street',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          postalCode: '12345',
          country: 'Indonesia',
          phoneNumber: '+6281234567890'
        },
        paymentMethod: 'bank_transfer'
      };

      await orderService.createOrderFromCart(buyerUser.user.id, createOrderDto);

      const cartItems = await cartService.getCartItems(buyerUser.user.id);
      expect(cartItems).toHaveLength(0);
    });

    it('should fail when cart is empty', async () => {
      // Clear cart first
      await cartService.clearCart(buyerUser.user.id);

      const createOrderDto: CreateOrderDto = {
        shippingAddress: {
          fullName: 'Test Buyer',
          addressLine1: '123 Test Street',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          postalCode: '12345',
          country: 'Indonesia',
          phoneNumber: '+6281234567890'
        },
        paymentMethod: 'bank_transfer'
      };

      await expect(
        orderService.createOrderFromCart(buyerUser.user.id, createOrderDto)
      ).rejects.toThrow('Cart is empty');
    });
  });

  describe('Order Retrieval', () => {
    let testOrder: any;

    beforeEach(async () => {
      const createOrderDto: CreateOrderDto = {
        shippingAddress: {
          fullName: 'Test Buyer',
          addressLine1: '123 Test Street',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          postalCode: '12345',
          country: 'Indonesia',
          phoneNumber: '+6281234567890'
        },
        paymentMethod: 'bank_transfer'
      };

      testOrder = await orderService.createOrderFromCart(
        buyerUser.user.id,
        createOrderDto
      );
    });

    it('should get order by ID for buyer', async () => {
      const order = await orderService.getOrderById(
        testOrder.id,
        buyerUser.user.id
      );

      expect(order).toBeDefined();
      expect(order.id).toBe(testOrder.id);
      expect(order.buyerId).toBe(buyerUser.user.id);
    });

    it('should get order by ID for seller', async () => {
      const order = await orderService.getOrderById(
        testOrder.id,
        sellerUser.user.id
      );

      expect(order).toBeDefined();
      expect(order.id).toBe(testOrder.id);
      expect(order.sellerId).toBe(sellerUser.user.id);
    });

    it('should fail to get order for unauthorized user', async () => {
      const unauthorizedUser = await authService.signUp({
        email: 'unauthorized@test.com',
        password: 'password123',
        firstName: 'Unauthorized',
        lastName: 'User',
        roles: [UserRole.USER],
        activeMode: UserRole.USER
      });

      await expect(
        orderService.getOrderById(testOrder.id, unauthorizedUser.user.id)
      ).rejects.toThrow('Order not found or access denied');
    });

    it('should get orders with pagination', async () => {
      const result = await orderService.getOrders({
        page: 1,
        limit: 10,
        buyerId: buyerUser.user.id
      });

      expect(result.orders).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('Order Status Management', () => {
    let testOrder: any;

    beforeEach(async () => {
      const createOrderDto: CreateOrderDto = {
        shippingAddress: {
          fullName: 'Test Buyer',
          addressLine1: '123 Test Street',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          postalCode: '12345',
          country: 'Indonesia',
          phoneNumber: '+6281234567890'
        },
        paymentMethod: 'bank_transfer'
      };

      testOrder = await orderService.createOrderFromCart(
        buyerUser.user.id,
        createOrderDto
      );
    });

    it('should update order status by seller', async () => {
      const updatedOrder = await orderService.updateOrderStatus(
        testOrder.id,
        {
          status: OrderStatus.CONFIRMED,
          trackingNumber: 'TRK123456',
          notes: 'Order confirmed'
        },
        sellerUser.user.id
      );

      expect(updatedOrder.status).toBe(OrderStatus.CONFIRMED);
      expect(updatedOrder.trackingNumber).toBe('TRK123456');
    });

    it('should prevent invalid status transitions', async () => {
      await expect(
        orderService.updateOrderStatus(
          testOrder.id,
          {
            status: OrderStatus.DELIVERED // Invalid: PENDING -> DELIVERED
          },
          sellerUser.user.id
        )
      ).rejects.toThrow('Invalid status transition');
    });

    it('should cancel order by buyer', async () => {
      const cancelledOrder = await orderService.cancelOrder(
        testOrder.id,
        {
          reason: 'Changed mind',
          refundRequested: true
        },
        buyerUser.user.id
      );

      expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED);
      expect(cancelledOrder.cancellationReason).toBe('Changed mind');
      expect(cancelledOrder.cancelledAt).toBeDefined();
    });

    it('should prevent cancellation of shipped orders', async () => {
      // First update to shipped
      await orderService.updateOrderStatus(
        testOrder.id,
        { status: OrderStatus.CONFIRMED },
        sellerUser.user.id
      );
      await orderService.updateOrderStatus(
        testOrder.id,
        { status: OrderStatus.PREPARING },
        sellerUser.user.id
      );
      await orderService.updateOrderStatus(
        testOrder.id,
        { status: OrderStatus.SHIPPED },
        sellerUser.user.id
      );

      await expect(
        orderService.cancelOrder(
          testOrder.id,
          { reason: 'Test' },
          buyerUser.user.id
        )
      ).rejects.toThrow('Cannot cancel order that has been shipped');
    });
  });

  describe('Order Statistics', () => {
    beforeEach(async () => {
      // Create multiple orders for statistics
      const createOrderDto: CreateOrderDto = {
        shippingAddress: {
          fullName: 'Test Buyer',
          addressLine1: '123 Test Street',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          postalCode: '12345',
          country: 'Indonesia',
          phoneNumber: '+6281234567890'
        },
        paymentMethod: 'bank_transfer'
      };

      await orderService.createOrderFromCart(buyerUser.user.id, createOrderDto);
      
      // Add another item to cart and create another order
      await cartService.addToCart(buyerUser.user.id, {
        listingId: testListing.id,
        quantity: 1
      });
      
      await orderService.createOrderFromCart(buyerUser.user.id, createOrderDto);
    });

    it('should get buyer statistics', async () => {
      const stats = await orderService.getOrderStats(
        buyerUser.user.id,
        'buyer'
      );

      expect(stats.totalOrders).toBe(2);
      expect(stats.totalValue).toBe(300000); // 200k + 100k
      expect(stats.pendingOrders).toBe(2);
      expect(stats.completedOrders).toBe(0);
      expect(stats.averageOrderValue).toBe(150000);
    });

    it('should get seller statistics', async () => {
      const stats = await orderService.getOrderStats(
        sellerUser.user.id,
        'seller'
      );

      expect(stats.totalOrders).toBe(2);
      expect(stats.totalValue).toBe(300000);
      expect(stats.pendingOrders).toBe(2);
      expect(stats.completedOrders).toBe(0);
    });
  });
});
