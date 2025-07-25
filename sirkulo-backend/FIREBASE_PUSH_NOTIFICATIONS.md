# Firebase Push Notifications Implementation Guide

## Overview

This document provides a complete guide for implementing Firebase Cloud Messaging (FCM) push notifications in the Sirkulo backend. The implementation includes device token management, notification sending, topic subscriptions, and integration with existing services.

## Features Implemented

### 🔥 Firebase Service (`src/services/firebase.service.ts`)
- **Firebase Admin SDK Integration**: Complete setup with service account authentication
- **Device Notifications**: Send push notifications to individual devices
- **Multicast Notifications**: Send notifications to multiple devices simultaneously
- **Topic Notifications**: Broadcast notifications to topic subscribers
- **Token Validation**: Validate FCM tokens before sending notifications
- **Topic Management**: Subscribe/unsubscribe devices to/from topics
- **Platform-Specific Configs**: Optimized settings for Android, iOS, and Web

### 📱 Device Token Management (`src/models/device-token.model.ts`)
- **Token Storage**: Store and manage FCM tokens in PostgreSQL
- **Platform Support**: Support for Android, iOS, and Web platforms
- **User Association**: Link tokens to user accounts
- **Activity Tracking**: Track token usage and last active timestamps
- **Token Lifecycle**: Activate/deactivate tokens as needed

### 🎯 Push Notification Controller (`src/controllers/push-notification.controller.ts`)
- **Token Registration**: Register device tokens for users
- **Token Unregistration**: Remove device tokens
- **Test Notifications**: Send test notifications for debugging
- **Topic Broadcasting**: Admin-only topic notifications
- **Preference Management**: User notification preferences
- **Token Listing**: View user's registered devices

### 🛣️ API Routes (`src/routes/push-notification.routes.ts`)
- **Secured Endpoints**: All routes protected with JWT authentication
- **Input Validation**: Comprehensive validation using express-validator
- **Error Handling**: Proper error responses and logging

## Configuration

### Environment Variables
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=sirkulo-c2459
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sirkulo-c2459.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_PRIVATE_KEY]\n-----END PRIVATE KEY-----"
```

### Config Integration
The Firebase configuration is integrated into the main config system (`src/config/index.ts`):
```typescript
firebase: {
  projectId: process.env.FIREBASE_PROJECT_ID || 'sirkulo-c2459',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
  privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
}
```

## API Endpoints

### Authentication Required
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Register Device Token
```http
POST /api/notifications/register-token
Content-Type: application/json

{
  "token": "FCM_DEVICE_TOKEN",
  "platform": "android|ios|web",
  "deviceInfo": "Optional device info",
  "appVersion": "1.0.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device token registered successfully",
  "data": {
    "tokenId": 1,
    "platform": "android"
  }
}
```

### 2. Unregister Device Token
```http
DELETE /api/notifications/unregister-token
Content-Type: application/json

{
  "token": "FCM_DEVICE_TOKEN"
}
```

### 3. Send Test Notification
```http
POST /api/notifications/test
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test message",
  "data": {
    "key": "value"
  }
}
```

### 4. Get User's Device Tokens
```http
GET /api/notifications/tokens
```

### 5. Update Notification Preferences
```http
PUT /api/notifications/preferences
Content-Type: application/json

{
  "topics": [
    "general_notifications",
    "order_updates",
    "new_listings",
    "price_alerts"
  ]
}
```

### 6. Send Topic Notification (Admin Only)
```http
POST /api/notifications/topic
Content-Type: application/json

{
  "topic": "general_notifications",
  "title": "System Announcement",
  "body": "Important system update",
  "data": {
    "type": "system"
  }
}
```

## Available Topics

The system supports these notification topics:
- `general_notifications` - General app notifications
- `order_updates` - Order status changes
- `new_listings` - New product listings
- `price_alerts` - Price change notifications
- `chat_messages` - Chat notifications
- `promotional_offers` - Marketing notifications

## Predefined Notification Methods

### Welcome Notification
```typescript
await firebaseService.sendWelcomeNotification(token, userName);
```

### Order Status Notification
```typescript
await firebaseService.sendOrderNotification(token, orderId, status, message);
```

### New Listing Notification
```typescript
await firebaseService.sendNewListingNotification(tokens, title, category, price);
```

### Chat Message Notification
```typescript
await firebaseService.sendChatNotification(token, senderName, message, chatId);
```

## Integration Examples

### User Registration Flow
```typescript
// After user registration and email verification
if (deviceToken) {
  await firebaseService.sendWelcomeNotification(deviceToken, user.firstName);
}
```

### Order Status Updates
```typescript
// When order status changes
const userTokens = await getUserActiveTokens(order.userId);
const tokens = userTokens.map(dt => dt.token);

await firebaseService.sendOrderNotification(
  tokens[0], // Send to primary device
  order.id,
  'shipped',
  'Your order has been shipped and is on the way!'
);
```

### New Listing Alerts
```typescript
// When new listing is created
const interestedUsers = await getUsersByCategory(listing.category);
const tokens = await getActiveTokensForUsers(interestedUsers);

await firebaseService.sendNewListingNotification(
  tokens,
  listing.title,
  listing.category,
  listing.price
);
```

## Testing

### Firebase Connection Test
```bash
npm run test:firebase
```

This test script verifies:
- Firebase Admin SDK initialization
- Service method functionality
- Token validation
- Topic subscription/unsubscription

### Manual Testing with Postman/curl
1. Register a device token using the mobile app FCM SDK
2. Use the registration endpoint to save the token
3. Send test notifications via the API
4. Verify notifications are received on the device

## Mobile App Integration

### Android (React Native)
```javascript
import messaging from '@react-native-firebase/messaging';

// Get FCM token
const token = await messaging().getToken();

// Register token with backend
await fetch('/api/notifications/register-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    token,
    platform: 'android',
    deviceInfo: DeviceInfo.getModel(),
    appVersion: DeviceInfo.getVersion()
  })
});
```

### iOS (React Native)
```javascript
// Request permission first
const authStatus = await messaging().requestPermission();
if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
  const token = await messaging().getToken();
  // Register token with backend
}
```

### Web (Firebase SDK)
```javascript
import { getMessaging, getToken } from 'firebase/messaging';

const messaging = getMessaging();
const token = await getToken(messaging, { 
  vapidKey: 'YOUR_VAPID_KEY' 
});
// Register token with backend
```

## Security Considerations

### Token Validation
- All FCM tokens are validated before registration
- Invalid tokens are rejected with appropriate error messages
- Token validation prevents spam and invalid registrations

### Authentication
- All endpoints require JWT authentication
- Admin-only endpoints check user roles
- User can only manage their own device tokens

### Data Privacy
- Device tokens are associated with user accounts
- Personal device information is optional and limited
- Tokens are deactivated on unregistration for audit purposes

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Error Types
- **400 Bad Request**: Invalid input data, malformed token
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions (admin-only endpoints)
- **404 Not Found**: Device token not found
- **500 Internal Server Error**: Firebase service errors, database errors

## Monitoring and Logging

### Console Logging
The service includes comprehensive logging:
```typescript
console.log('📱 Push notification sent successfully:', response);
console.error('❌ Push notification error:', error);
console.log('📱 Device token registered for user:', userId);
```

### Success Metrics
- Notification delivery success/failure counts
- Device token registration/unregistration tracking
- Topic subscription management logs

## Database Schema

### Device Tokens Table
```sql
CREATE TABLE device_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  platform ENUM('android', 'ios', 'web') NOT NULL,
  device_info VARCHAR(100),
  app_version VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
```sql
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON device_tokens(is_active);
CREATE INDEX idx_device_tokens_platform ON device_tokens(platform);
```

## Production Deployment

### Environment Setup
1. **Firebase Project**: Ensure Firebase project is properly configured
2. **Service Account**: Download and configure Firebase service account key
3. **Environment Variables**: Set all required Firebase environment variables
4. **Database Migration**: Run TypeORM migrations to create device_tokens table

### Performance Considerations
- **Batch Processing**: Use multicast for sending to multiple devices
- **Token Cleanup**: Implement cleanup for inactive/expired tokens
- **Rate Limiting**: Consider implementing rate limits for notification endpoints
- **Caching**: Cache frequently used topic subscriptions

### Scaling
- **Topic Subscriptions**: Use topics for efficient broadcasting
- **Queue Processing**: Consider implementing job queues for high-volume notifications
- **Database Optimization**: Index frequently queried columns
- **Connection Pooling**: Optimize database connection usage

## Troubleshooting

### Common Issues

#### Firebase Initialization Errors
```bash
Error: Failed to initialize Firebase Admin SDK
```
**Solution**: Check Firebase credentials and project ID in environment variables

#### Invalid Token Errors
```bash
Error: Registration token is not a valid FCM registration token
```
**Solution**: Verify FCM token format and ensure it's from the correct Firebase project

#### Permission Errors
```bash
Error: Admin access required
```
**Solution**: Ensure user has admin role for topic notification endpoints

#### Database Connection Errors
```bash
Error: Cannot save device token
```
**Solution**: Check database connection and ensure device_tokens table exists

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` for detailed error information and stack traces.

## Next Steps

### Enhancement Opportunities
1. **Analytics Integration**: Track notification open rates and engagement
2. **Rich Notifications**: Support for images, actions, and rich content
3. **Scheduled Notifications**: Implement delayed and scheduled notifications
4. **A/B Testing**: Support for notification content testing
5. **Localization**: Multi-language notification support
6. **Push Templates**: Pre-built notification templates for common scenarios

### Integration Points
1. **Email Service**: Fallback to email when push notifications fail
2. **SMS Service**: Multi-channel notification strategy
3. **WebSocket Integration**: Real-time notifications for active users
4. **Analytics Dashboard**: Admin dashboard for notification metrics

## Support

For technical support or questions regarding the Firebase push notification implementation:
1. Check the error logs in the server console
2. Verify Firebase project configuration
3. Test with the provided test endpoints
4. Review the comprehensive API documentation above

---

**Note**: This implementation provides a production-ready foundation for push notifications in the Sirkulo marketplace. The system is designed to be scalable, secure, and maintainable for a hackathon demo and future production use.
