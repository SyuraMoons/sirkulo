# Payment API Documentation

## Base URL
```
http://localhost:3000/api/payments
```

## Authentication
All payment endpoints (except webhook) require authentication via Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Create Payment
**POST** `/`

Create a payment for an order using various Xendit payment methods.

**Request Body:**
```json
{
  "orderId": 1,
  "paymentMethod": "VIRTUAL_ACCOUNT",
  "bankCode": "BCA",
  "customer": {
    "givenNames": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "+6281234567890"
  },
  "successRedirectUrl": "https://yourapp.com/payment/success",
  "failureRedirectUrl": "https://yourapp.com/payment/failure"
}
```

**Payment Methods:**
- `VIRTUAL_ACCOUNT` - Bank virtual account
- `BANK_TRANSFER` - Direct bank transfer
- `EWALLET` - E-wallet payments (OVO, Dana, GoPay, etc.)
- `RETAIL_OUTLET` - Convenience store payments
- `CREDIT_CARD` - Credit card payments

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": 1,
    "amount": 1500000,
    "status": "PENDING",
    "paymentMethod": "VIRTUAL_ACCOUNT",
    "virtualAccountNumber": "8808123456789",
    "expiryDate": "2024-01-16T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Get Payments
**GET** `/`

Retrieve payments with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `orderId` (number): Filter by order ID
- `status` (string): Filter by payment status (PENDING, PAID, FAILED, EXPIRED)
- `paymentMethod` (string): Filter by payment method
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": {
    "payments": [...],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### 3. Get Payment by ID
**GET** `/:id`

Retrieve specific payment details.

**Response:**
```json
{
  "success": true,
  "message": "Payment retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "orderId": 1,
    "amount": 1500000,
    "status": "PAID",
    "paymentMethod": "VIRTUAL_ACCOUNT",
    "virtualAccountNumber": "8808123456789",
    "paidAt": "2024-01-15T11:30:00Z",
    "refundableAmount": 1500000,
    "canBeRefunded": true,
    "order": {...},
    "refunds": [...]
  }
}
```

### 4. Create Refund
**POST** `/:id/refund`

Create a refund for a paid payment.

**Request Body:**
```json
{
  "amount": 1500000,
  "reason": "Customer requested cancellation",
  "notes": "Full refund due to order cancellation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund created successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "paymentId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 1500000,
    "status": "PENDING",
    "reason": "Customer requested cancellation",
    "xenditRefundId": "rfnd_test_123",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

### 5. Get Payment Statistics
**GET** `/stats`

Get payment statistics for the authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "Payment statistics retrieved successfully",
  "data": {
    "totalTransactions": 25,
    "totalAmount": 37500000,
    "pendingPayments": 2,
    "successfulPayments": 20,
    "failedPayments": 2,
    "expiredPayments": 1,
    "successRate": 80.0,
    "averageAmount": 1500000
  }
}
```

### 6. Get Payment Methods
**GET** `/methods`

Get supported payment methods and their details (no authentication required).

**Response:**
```json
{
  "success": true,
  "message": "Payment methods retrieved successfully",
  "data": {
    "bankTransfer": {
      "name": "Bank Transfer",
      "code": "BANK_TRANSFER",
      "description": "Transfer via ATM, internet banking, or mobile banking",
      "banks": [
        {"code": "BCA", "name": "Bank Central Asia", "fee": 0},
        {"code": "BNI", "name": "Bank Negara Indonesia", "fee": 0}
      ]
    },
    "ewallet": {
      "name": "E-Wallet",
      "code": "EWALLET",
      "description": "Pay using your favorite e-wallet",
      "providers": [
        {"code": "OVO", "name": "OVO", "fee": 0},
        {"code": "DANA", "name": "DANA", "fee": 0}
      ]
    }
  }
}
```

### 7. Webhook Handler
**POST** `/webhook`

Handle Xendit payment webhooks (no authentication required).

This endpoint is called by Xendit when payment status changes. Configure this URL in your Xendit dashboard:
```
https://yourdomain.com/api/payments/webhook
```

## Payment Flow

### 1. Order Creation
1. User adds items to cart
2. User creates an order from cart
3. Order status: PENDING, Payment status: PENDING

### 2. Payment Creation
1. User selects payment method
2. Call `POST /api/payments` with order ID and payment details
3. Receive payment instructions (virtual account number, QR code, etc.)
4. Payment status: PENDING

### 3. Payment Processing
1. User completes payment via chosen method
2. Xendit sends webhook to `/api/payments/webhook`
3. System updates payment status to PAID
4. Order status changes to CONFIRMED

### 4. Refund Process (if needed)
1. User or seller requests refund
2. Call `POST /api/payments/:id/refund`
3. Xendit processes refund
4. Payment status updated accordingly

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Payment Methods Details

### Virtual Account
- Instant bank transfer using unique account number
- Available banks: BCA, BNI, BRI, Mandiri, Permata, BSI
- Expiry: 24 hours
- No additional fees

### E-Wallet
- Quick payment via mobile apps
- Available: OVO, Dana, LinkAja, ShopeePay, GoPay
- Instant confirmation
- Redirect-based flow

### Retail Outlet
- Pay at convenience stores
- Available: Alfamart, Indomaret
- Payment code provided
- Small convenience fee may apply

### Bank Transfer
- Direct bank transfer
- Manual confirmation required
- All major Indonesian banks supported