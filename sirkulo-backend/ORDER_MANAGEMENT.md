# Sirkulo Order Management System

## Overview

The Order Management System is a comprehensive solution for handling the complete lifecycle of orders in the Sirkulo circular economy marketplace. It enables buyers to convert their shopping carts into orders and provides sellers with tools to manage order fulfillment.

## Features

### Core Functionality
- **Cart to Order Conversion**: Seamlessly convert shopping cart items into orders
- **Multi-Seller Support**: Handle orders from multiple sellers in a single transaction
- **Order Status Tracking**: Complete lifecycle management from pending to delivered
- **Payment Integration Ready**: Structured for payment gateway integration
- **Inventory Management**: Automatic quantity validation and reservation
- **Order Analytics**: Comprehensive statistics and reporting
- **Role-Based Access**: Separate views for buyers, sellers, and admins

### Order Statuses
- `PENDING` - Order created, awaiting payment
- `CONFIRMED` - Payment processed, preparing for shipment
- `PREPARING` - Items being prepared for shipment
- `SHIPPED` - Order dispatched to customer
- `DELIVERED` - Order successfully delivered
- `CANCELLED` - Order cancelled by buyer or seller
- `REFUNDED` - Order refunded after cancellation

### Payment Statuses
- `PENDING` - Awaiting payment
- `PAID` - Payment completed
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

## API Endpoints

### Authentication
All order endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Order Creation
**POST** `/api/orders`

Creates order from current user's cart items.

**Request Body:**
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "postalCode": "12345",
    "country": "Indonesia",
    "phoneNumber": "+6281234567890"
  },
  "paymentMethod": "bank_transfer",
  "notes": "Please deliver in the morning"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "orderNumber": "ORD-2024-001",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "totalAmount": 150000,
    "shippingCost": 25000,
    "taxAmount": 16500,
    "finalAmount": 191500,
    "items": [...],
    "shippingAddress": {...},
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Order Retrieval

#### Get All Orders
**GET** `/api/orders`

Retrieves orders with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by order status
- `paymentStatus` (string): Filter by payment status
- `sellerId` (number): Filter by seller (admin only)
- `buyerId` (number): Filter by buyer (admin only)
- `startDate` (string): Filter orders from date (ISO 8601)
- `endDate` (string): Filter orders to date (ISO 8601)

#### Get Order by ID
**GET** `/api/orders/:id`

Retrieves specific order details.

#### Get Purchase Orders
**GET** `/api/orders/purchases`

Retrieves orders where current user is the buyer.

#### Get Sales Orders
**GET** `/api/orders/sales`

Retrieves orders where current user is the seller.

### Order Management

#### Update Order Status
**PUT** `/api/orders/:id/status`

Updates order status (seller/admin only).

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "trackingNumber": "TRK123456789",
  "notes": "Order confirmed and preparing for shipment"
}
```

#### Cancel Order
**POST** `/api/orders/:id/cancel`

Cancels an order (buyer/seller/admin).

**Request Body:**
```json
{
  "reason": "Customer requested cancellation",
  "refundRequested": true
}
```

### Order Statistics
**GET** `/api/orders/stats`

Retrieves order statistics for current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 45,
    "totalValue": 2500000,
    "pendingOrders": 3,
    "completedOrders": 40,
    "averageOrderValue": 55555,
    "monthlyStats": {
      "orders": 12,
      "revenue": 650000
    }
  }
}
```

## Database Schema

### Order Entity
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  status order_status NOT NULL DEFAULT 'PENDING',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(50),
  total_amount DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  final_amount DECIMAL(12,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number VARCHAR(100),
  notes TEXT,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### OrderItem Entity
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  listing_snapshot JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Business Logic

### Order Creation Process
1. **Validation**: Verify cart has items and all items are available
2. **Inventory Check**: Validate sufficient quantities for all items
3. **Price Calculation**: Calculate totals including shipping and tax
4. **Seller Grouping**: Group cart items by seller for multi-seller orders
5. **Order Generation**: Create order(s) with unique order numbers
6. **Cart Clearing**: Remove ordered items from cart
7. **Notification**: Send order confirmation (future feature)

### Order Status Flow
```
PENDING → CONFIRMED → PREPARING → SHIPPED → DELIVERED
    ↓
 CANCELLED ← REFUNDED
```

### Multi-Seller Order Handling
When a cart contains items from multiple sellers:
- Separate orders are created for each seller
- Each order has its own tracking and status
- Shipping costs are calculated per seller
- Payment is processed for the total amount

### Inventory Management
- Order creation validates item availability
- Quantities are reserved (future feature)
- Failed orders release reserved inventory
- Delivered orders update sold quantities

## Security Features

### Access Control
- **Buyers**: Can create orders, view own purchase history, cancel pending orders
- **Sellers**: Can view sales orders, update order status, cancel orders
- **Admins**: Full access to all orders and statistics

### Data Protection
- Sensitive payment information is not stored
- Personal addresses are encrypted in database
- Order history is retained for audit purposes
- GDPR compliance for data deletion requests

## Integration Points

### Payment Gateways
The system is structured for easy integration with:
- Stripe
- Xendit (Indonesian market)
- Midtrans (Indonesian market)
- Bank transfer verification

### Shipping Providers
Ready for integration with:
- JNE (Indonesia)
- GoSend (Indonesia)
- Grab Express
- Custom logistics providers

### Notification Services
Prepared for integration with:
- Email notifications (order confirmations, status updates)
- SMS notifications
- Push notifications (mobile app)
- WhatsApp Business API

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Error Codes
- `400` - Bad Request (validation errors, insufficient inventory)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (order not found)
- `409` - Conflict (order already processed)
- `500` - Internal Server Error

## Testing

### Unit Tests
Run order service tests:
```bash
npm test -- --testNamePattern="Order"
```

### API Testing
Example test cases included in `test_order.json`:
```json
{
  "createOrder": {
    "url": "/api/orders",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer <token>",
      "Content-Type": "application/json"
    },
    "body": { /* order data */ }
  }
}
```

## Performance Considerations

### Database Optimization
- Indexed fields: order_number, buyer_id, seller_id, status, created_at
- Composite indexes for common query patterns
- Pagination for large order lists
- Read replicas for analytics queries

### Caching Strategy
- Order statistics cached for 15 minutes
- Frequently accessed orders cached in Redis
- Seller order counts cached and updated on status changes

### Monitoring
- Order creation success rate
- Average order processing time
- Payment failure rates
- Order cancellation reasons

## Future Enhancements

### Phase 2 Features
- **Order Splitting**: Split large orders across multiple shipments
- **Recurring Orders**: Support for subscription-based orders
- **Order Templates**: Save frequent orders as templates
- **Bulk Operations**: Bulk status updates for sellers

### Integration Roadmap
- **Payment Processing**: Complete payment gateway integration
- **Shipping Integration**: Real-time shipping rates and tracking
- **Notification System**: Comprehensive order notifications
- **Mobile App**: React Native mobile application

### Analytics & Reporting
- **Order Analytics Dashboard**: Advanced reporting for sellers
- **Market Insights**: Circular economy impact metrics
- **Predictive Analytics**: Demand forecasting for sellers
- **Export Features**: CSV/PDF export for accounting systems

## Support & Maintenance

### Monitoring
- Order system health checks
- Database performance monitoring
- Error rate tracking
- User satisfaction metrics

### Backup & Recovery
- Daily database backups
- Order data retention policies
- Disaster recovery procedures
- Data migration scripts

This Order Management System provides a solid foundation for the Sirkulo marketplace, enabling efficient order processing while maintaining flexibility for future enhancements and integrations.
