# Environment Variables for Xendit Payment Integration

# Add these to your .env file for Xendit payment integration to work

# Xendit Configuration
XENDIT_SECRET_KEY=your_xendit_secret_key_here
XENDIT_WEBHOOK_TOKEN=your_xendit_webhook_token_here

# Example for testing (use sandbox credentials):
# XENDIT_SECRET_KEY=xnd_development_...
# XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token

# Frontend URLs for payment redirects
FRONTEND_URL=http://localhost:3001

# These should already exist in your .env:
# DATABASE_URL=your_database_url
# REDIS_URL=your_redis_url
# JWT_SECRET=your_jwt_secret