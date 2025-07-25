#!/usr/bin/env node

/**
 * Email service test script for Sirkulo backend
 * Run with: npm run test:email or node test-email.js
 */

import { EmailService } from './src/services/email.service';
import config from './src/config';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testEmailService() {
  log(colors.blue, '🧪 Testing Sirkulo Email Service...\n');
  
  const emailService = new EmailService();
  let testsPassed = 0;
  let testsTotal = 0;

  // Test 1: Configuration Test
  testsTotal++;
  log(colors.yellow, '1. Testing email configuration...');
  try {
    const configValid = await emailService.testEmailConfiguration();
    if (configValid) {
      log(colors.green, '   ✅ Email configuration is valid');
      testsPassed++;
    } else {
      log(colors.red, '   ❌ Email configuration failed');
    }
  } catch (error) {
    log(colors.red, `   ❌ Configuration test error: ${error}`);
  }

  // Test 2: Verification Email
  if (config.email.sendgrid.apiKey) {
    testsTotal++;
    log(colors.yellow, '2. Testing verification email...');
    try {
      const result = await emailService.sendVerificationEmail(
        config.email.from.email, // Send to yourself for testing
        {
          firstName: 'Test User',
          verificationUrl: 'http://localhost:3000/verify?token=test123',
          companyName: 'Sirkulo'
        }
      );

      if (result) {
        log(colors.green, '   ✅ Verification email sent successfully');
        testsPassed++;
      } else {
        log(colors.red, '   ❌ Verification email failed');
      }
    } catch (error) {
      log(colors.red, `   ❌ Verification email error: ${error}`);
    }

    // Test 3: Welcome Email
    testsTotal++;
    log(colors.yellow, '3. Testing welcome email...');
    try {
      const result = await emailService.sendWelcomeEmail(
        config.email.from.email,
        {
          firstName: 'Test User',
          userType: 'business'
        }
      );

      if (result) {
        log(colors.green, '   ✅ Welcome email sent successfully');
        testsPassed++;
      } else {
        log(colors.red, '   ❌ Welcome email failed');
      }
    } catch (error) {
      log(colors.red, `   ❌ Welcome email error: ${error}`);
    }
  } else {
    log(colors.yellow, '⚠️  Skipping email sending tests - SendGrid API key not configured');
  }

  // Summary
  log(colors.blue, `\n📊 Test Results: ${testsPassed}/${testsTotal} tests passed`);
  
  if (testsPassed === testsTotal) {
    log(colors.green, '🎉 All tests passed! Your email service is ready.');
  } else {
    log(colors.red, '❌ Some tests failed. Check your configuration.');
  }

  // Configuration guide
  if (!config.email.sendgrid.apiKey) {
    log(colors.blue, '\n📋 Configuration Guide:');
    log(colors.yellow, '1. Get your SendGrid API key from: https://sendgrid.com/');
    log(colors.yellow, '2. Add it to your .env file as: SENDGRID_API_KEY=SG.your_key_here');
    log(colors.yellow, '3. Set FROM_EMAIL=your-email@domain.com');
    log(colors.yellow, '4. Set FROM_NAME="Your App Name"');
    log(colors.yellow, '5. Run this test again: npm run test:email');
  }

  process.exit(testsPassed === testsTotal ? 0 : 1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log(colors.red, `❌ Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the test
testEmailService().catch(error => {
  log(colors.red, `❌ Test script error: ${error}`);
  process.exit(1);
});
