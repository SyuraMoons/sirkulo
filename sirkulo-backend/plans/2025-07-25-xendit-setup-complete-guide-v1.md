# Complete Xendit Setup Guide for Sirkulo Backend

## Overview
This guide will walk you through setting up Xendit payment integration for your Sirkulo marketplace, including account creation, obtaining API keys, and configuring webhooks.

## Prerequisites
- ✅ `xendit-node` package (already installed in your project)
- An Indonesian business or personal identification
- A valid Indonesian bank account
- Basic understanding of payment processing

## Step 1: Create Xendit Account

### 1.1 Sign Up for Xendit
1. Go to [Xendit Website](https://www.xendit.co/)
2. Click "Sign Up" or "Get Started"
3. Choose account type:
   - **Business Account** (Recommended for marketplace)
   - **Personal Account** (For testing/small scale)

### 1.2 Complete Registration
1. Fill in required information:
   - Business name (for business account)
   - Email address
   - Phone number
   - Business address
2. Verify your email and phone number
3. Upload required documents:
   - **Business**: Company registration, tax ID (NPWP), bank statement
   - **Personal**: KTP/ID card, bank statement

### 1.3 Account Verification
- Wait for Xendit team to verify your account (1-3 business days)
- You'll receive email confirmation once approved
- During verification, you can use sandbox/test environment

## Step 2: Access Xendit Dashboard

### 2.1 Login to Dashboard
1. Go to [Xendit Dashboard](https://dashboard.xendit.co/)
2. Login with your registered credentials
3. You'll see two environments:
   - **Live Mode** (Production)
   - **Test Mode** (Development/Sandbox)

### 2.2 Switch to Test Mode (For Development)
1. In the dashboard, look for environment toggle (top right)
2. Switch to "Test Mode" for development
3. All API keys and transactions will be in sandbox environment

## Step 3: Obtain API Keys

### 3.1 Get Secret Key
1. In Xendit Dashboard, go to **Settings** → **API Keys**
2. You'll see two types of keys:
   - **Publishable Key** (for frontend/client-side)
   - **Secret Key** (for backend/server-side) ⭐ **This is what you need**

3. **For Test Environment:**
   - Copy the **Test Secret Key**
   - Format: `xnd_development_...`

4. **For Production Environment:**
   - Copy the **Live Secret Key**  
   - Format: `xnd_production_...`

### 3.2 Security Best Practices
- ⚠️ **Never expose secret keys in frontend code**
- ⚠️ **Never commit secret keys to version control**
- ⚠️ **Use environment variables only**
- ⚠️ **Rotate keys periodically**

## Step 4: Set Up Webhooks

### 4.1 What are Webhooks?
Webhooks notify your application when payment events occur (payment completed, failed, etc.).

### 4.2 Configure Webhook URL
1. In Xendit Dashboard, go to **Settings** → **Webhooks**
2. Click **"Add New Webhook"**
3. Configure webhook:
   - **URL**: `https://yourdomain.com/api/payments/webhook`
   - **Events**: Select relevant events:
     - ✅ `invoice.paid`
     - ✅ `invoice.expired`
     - ✅ `invoice.payment_failed`
     - ✅ `virtual_account.payment`
     - ✅ `ewallet.payment`
     - ✅ `retail_outlet.payment`

### 4.3 Get Webhook Token
1. After creating webhook, Xendit provides a **Webhook Token**
2. This token is used to verify webhook authenticity
3. Copy this token for your environment variables

### 4.4 Webhook URL Requirements
- **Must be HTTPS** (for production)
- **Must be publicly accessible**
- **Must respond with 200 status code**
- **Response time < 10 seconds**

## Step 5: Environment Configuration

### 5.1 Update .env File
Add these variables to your `.env` file:

```env
# Xendit Configuration
XENDIT_SECRET_KEY=xnd_development_your_secret_key_here
XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token_here

# Frontend URL (for payment redirects)
FRONTEND_URL=http://localhost:3001

# For production, use:
# XENDIT_SECRET_KEY=xnd_production_your_secret_key_here
```

### 5.2 Environment Variables Explanation
- `XENDIT_SECRET_KEY`: Your Xendit secret API key
- `XENDIT_WEBHOOK_TOKEN`: Token for webhook verification
- `FRONTEND_URL`: Your frontend URL for payment redirects

## Step 6: Testing Setup

### 6.1 Use Test Credentials
For development, always use **Test Mode** credentials:
- Test cards won't charge real money
- Test virtual accounts are simulated
- All transactions are sandbox only

### 6.2 Test Payment Methods

**Test Virtual Account Numbers:**
- BCA: Use any valid format (will be provided by API)
- BNI: Use any valid format (will be provided by API)
- BRI: Use any valid format (will be provided by API)

**Test E-wallet:**
- OVO: Use test phone numbers provided by Xendit
- Dana: Use test phone numbers provided by Xendit
- GoPay: Use test phone numbers provided by Xendit

**Test Credit Cards:**
- Successful: `4000000000000002`
- Failed: `4000000000000010`
- 3D Secure: `4000000000000028`

## Step 7: Webhook Testing

### 7.1 Local Development
For local testing, you need to expose your local server:

**Option 1: ngrok (Recommended)**
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the HTTPS URL for webhook configuration
# Example: https://abc123.ngrok.io/api/payments/webhook
```

**Option 2: Webhook Testing Tools**
- Use [Webhook.site](https://webhook.site) for testing
- Copy test webhook payloads to your application

### 7.2 Test Webhook Events
1. Create a test payment
2. Complete payment using test methods
3. Check your application logs for webhook calls
4. Verify payment status updates correctly

## Step 8: Production Deployment

### 8.1 Switch to Live Mode
1. Complete business verification
2. Get production API keys
3. Update environment variables
4. Configure production webhook URLs

### 8.2 Production Checklist
- ✅ Business account verified
- ✅ Production API keys obtained
- ✅ HTTPS webhook URL configured
- ✅ SSL certificate valid
- ✅ Webhook token updated
- ✅ Error monitoring in place
- ✅ Payment flow tested end-to-end

## Step 9: Monitoring and Maintenance

### 9.1 Dashboard Monitoring
- Monitor transactions in Xendit Dashboard
- Check for failed payments
- Review settlement reports
- Monitor webhook delivery status

### 9.2 Application Monitoring
- Log all payment operations
- Monitor webhook response times
- Set up alerts for payment failures
- Track payment success rates

## Common Issues and Troubleshooting

### Issue 1: Webhook Not Receiving Events
**Solutions:**
- Verify webhook URL is publicly accessible
- Check HTTPS configuration
- Ensure endpoint returns 200 status
- Verify webhook token configuration

### Issue 2: Authentication Errors
**Solutions:**
- Verify secret key is correct
- Check environment variable names
- Ensure no extra spaces in keys
- Verify test vs production mode

### Issue 3: Payment Method Not Available
**Solutions:**
- Check if payment method is enabled in dashboard
- Verify business verification status
- Contact Xendit support for method availability

### Issue 4: Webhook Signature Verification Failed
**Solutions:**
- Verify webhook token is correct
- Check signature verification implementation
- Ensure raw request body is used for verification

## Support and Resources

### Xendit Documentation
- [Official Documentation](https://developers.xendit.co/)
- [API Reference](https://developers.xendit.co/api-reference/)
- [SDKs and Libraries](https://developers.xendit.co/api-reference/#sdks-and-libraries)

### Xendit Support
- **Email**: support@xendit.co
- **Phone**: +62 21 3949 0050
- **Live Chat**: Available in dashboard
- **Response Time**: 24-48 hours for technical issues

### Developer Resources
- [Postman Collection](https://developers.xendit.co/api-reference/#postman-collection)
- [Code Examples](https://github.com/xendit/xendit-node-example)
- [Test Data](https://developers.xendit.co/api-reference/#test-data)

## Security Considerations

### API Key Security
- Store keys in environment variables only
- Use different keys for different environments
- Rotate keys regularly (quarterly recommended)
- Monitor key usage in dashboard

### Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook URLs
- Implement idempotency for webhook handling
- Log webhook events for auditing

### PCI Compliance
- Never store credit card information
- Use Xendit's secure payment forms
- Implement proper access controls
- Regular security audits

## Next Steps

After completing this setup:

1. **Test Payment Flow**: Create test orders and payments
2. **Implement Error Handling**: Add proper error handling for all scenarios
3. **Add Monitoring**: Set up payment monitoring and alerts
4. **Load Testing**: Test payment system under load
5. **Go Live**: Switch to production when ready

## Cost and Pricing

### Xendit Transaction Fees
- **Virtual Account**: 4,000 IDR per transaction
- **E-wallet**: 1.5% + 2,000 IDR per transaction
- **Credit Card**: 2.9% + 2,000 IDR per transaction
- **Retail Outlet**: 4,000 IDR per transaction

### Fee Structure
- Fees are deducted from settlement amounts
- No setup fees or monthly charges
- Volume discounts available for high-volume merchants

*Note: Fees may vary based on your agreement with Xendit. Check your dashboard for exact rates.*