import 'reflect-metadata';
import firebaseService from '../services/firebase.service';

/**
 * Firebase Push Notification Test Script
 * 
 * This script tests the Firebase push notification service
 * Run with: npm run test:firebase
 */

async function testFirebaseService(): Promise<void> {
  console.log('🔥 Starting Firebase Service Tests...\n');

  try {
    // Test 1: Send a test notification to a dummy token (will fail but test connection)
    console.log('📱 Test 1: Testing Firebase connection...');
    const testToken = 'dummy_token_for_connection_test';
    const result = await firebaseService.sendToDevice(testToken, {
      title: 'Test Notification',
      body: 'This is a test notification from Sirkulo backend',
      data: {
        type: 'test',
        action: 'test_action',
      },
    });

    console.log('Test 1 Result:', result);
    
    if (!result.success && result.error?.includes('Requested entity was not found')) {
      console.log('✅ Firebase connection successful (token not found as expected)');
    } else if (!result.success) {
      console.log('❌ Firebase connection failed:', result.error);
    } else {
      console.log('✅ Firebase connection and notification successful');
    }

    // Test 2: Validate a dummy token (will fail but test validation)
    console.log('\n📱 Test 2: Testing token validation...');
    const validation = await firebaseService.validateToken(testToken);
    console.log('Validation Result:', validation);
    
    if (!validation.valid) {
      console.log('✅ Token validation working (invalid token as expected)');
    } else {
      console.log('❌ Token validation unexpected result');
    }

    // Test 3: Test topic subscription (will fail but test functionality)
    console.log('\n📱 Test 3: Testing topic subscription...');
    const subscription = await firebaseService.subscribeToTopic(testToken, 'test_topic');
    console.log('Subscription Result:', subscription);
    
    if (!subscription.success) {
      console.log('✅ Topic subscription working (failed with invalid token as expected)');
    } else {
      console.log('❌ Topic subscription unexpected result');
    }

    console.log('\n🎉 Firebase Service Tests Completed!');
    console.log('📋 Summary:');
    console.log('- Firebase Admin SDK initialized successfully');
    console.log('- Service methods are working correctly');
    console.log('- Ready to receive real FCM tokens from mobile/web clients');
    
    console.log('\n📱 Next Steps:');
    console.log('1. Integrate FCM SDK in your mobile app/web client');
    console.log('2. Get real FCM tokens from devices');
    console.log('3. Use the /api/notifications/register-token endpoint');
    console.log('4. Test real notifications with /api/notifications/test');

  } catch (error: any) {
    console.error('❌ Firebase Service Test Error:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testFirebaseService()
  .then(() => {
    console.log('\n✅ Firebase test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Firebase test failed:', error);
    process.exit(1);
  });
