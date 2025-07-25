# Rating System Implementation Guide

## Overview

This document provides a complete guide for the rating system implementation in the Sirkulo backend. The rating system allows users to rate and review item listings, providing valuable feedback for the marketplace community.

## Features Implemented

### 🌟 Rating Model (`src/models/rating.model.ts`)
- **User-Listing Relationship**: Links ratings to specific users and listings
- **Rating Validation**: Enforces 1-5 star rating system
- **Comment Support**: Optional text reviews with ratings
- **Duplicate Prevention**: Unique constraint prevents multiple ratings from same user
- **Soft Delete**: Ratings are deactivated rather than permanently deleted
- **Optimized Queries**: Database indexes for performance

### 🎯 Rating Service (`src/services/rating.service.ts`)
- **CRUD Operations**: Complete create, read, update, delete functionality
- **Business Logic**: Prevents self-rating and duplicate ratings
- **Aggregate Calculations**: Real-time rating statistics and averages
- **Listing Integration**: Automatic updates to listing rating aggregates
- **Pagination Support**: Efficient handling of large rating datasets
- **Permission Checks**: Users can only modify their own ratings

### 🎮 Rating Controller (`src/controllers/rating.controller.ts`)
- **RESTful API**: Standard HTTP methods for rating operations
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Proper error responses and logging
- **Authentication**: JWT-protected endpoints
- **Response Formatting**: Consistent API response structure

### 🛣️ API Routes (`src/routes/rating.routes.ts`)
- **Secured Endpoints**: All routes protected with authentication
- **Input Validation**: Express-validator for request validation
- **Parameter Validation**: Type checking and range validation
- **Query Filtering**: Advanced filtering and sorting options

### 📊 Listing Integration (`src/models/listing.model.ts`)
- **Rating Aggregates**: Average rating and total count stored with listings
- **Automatic Updates**: Real-time updates when ratings change
- **Summary Display**: Rating information included in listing summaries
- **Performance Optimization**: Cached aggregates for fast queries

## Database Schema

### Rating Table
```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_active BOOLEAN DEFAULT true,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, listing_id)
);

-- Indexes for performance
CREATE INDEX idx_ratings_listing_id ON ratings(listing_id);
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_active ON ratings(is_active);
CREATE INDEX idx_ratings_listing_rating ON ratings(listing_id, rating);
```

### Updated Listing Table
```sql
-- Added rating aggregate columns
ALTER TABLE listings ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE listings ADD COLUMN total_ratings INTEGER DEFAULT 0;
```

## API Endpoints

### Authentication Required
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### 1. Create Rating
```http
POST /api/ratings
Content-Type: application/json

{
  "listingId": 123,
  "rating": 5,
  "comment": "Excellent quality fabric scraps!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rating created successfully",
  "data": {
    "id": 1,
    "rating": 5,
    "comment": "Excellent quality fabric scraps!",
    "listingId": 123,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Update Rating
```http
PUT /api/ratings/:id
Content-Type: application/json

{
  "rating": 4,
  "comment": "Good quality, but could be better sorted"
}
```

### 3. Delete Rating
```http
DELETE /api/ratings/:id
```

### 4. Get Listing Ratings
```http
GET /api/ratings/listing/:listingId?page=1&limit=10&sortBy=createdAt&sortOrder=DESC
```

**Response:**
```json
{
  "success": true,
  "message": "Listing ratings retrieved successfully",
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Excellent quality!",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": 2,
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe"
      }
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "stats": {
    "listingId": 123,
    "totalRatings": 15,
    "averageRating": 4.2,
    "ratingDistribution": {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 7,
      "5": 5
    }
  }
}
```

### 5. Get Rating Statistics
```http
GET /api/ratings/listing/:listingId/stats
```

### 6. Get User's Ratings
```http
GET /api/ratings/my-ratings?page=1&limit=10
```

### 7. Check Rating Eligibility
```http
GET /api/ratings/can-rate/:listingId
```

**Response:**
```json
{
  "success": true,
  "message": "Rating eligibility checked successfully",
  "data": {
    "canRate": true,
    "listingId": 123
  }
}
```

### 8. Get Specific Rating
```http
GET /api/ratings/:id
```

## Business Rules

### Rating Creation Rules
1. **Authentication Required**: Users must be logged in to create ratings
2. **No Self-Rating**: Users cannot rate their own listings
3. **One Rating Per User**: Each user can only rate a listing once
4. **Valid Rating Range**: Ratings must be between 1 and 5 stars
5. **Active Listings Only**: Can only rate active, available listings

### Rating Modification Rules
1. **Owner Only**: Users can only update/delete their own ratings
2. **Active Ratings Only**: Can only modify active (non-deleted) ratings
3. **Validation**: Updated ratings must still meet creation rules

### Listing Integration
1. **Automatic Updates**: Listing aggregates update immediately when ratings change
2. **Real-time Calculations**: Average ratings calculated from active ratings only
3. **Performance Optimization**: Aggregates stored for fast listing queries

## Validation Rules

### Rating Validation
- **rating**: Required integer between 1 and 5
- **comment**: Optional string, maximum 1000 characters
- **listingId**: Required positive integer

### Query Parameters
- **page**: Optional positive integer (default: 1)
- **limit**: Optional integer between 1 and 100 (default: 10)
- **sortBy**: Optional enum: 'createdAt', 'rating', 'updatedAt'
- **sortOrder**: Optional enum: 'ASC', 'DESC'
- **minRating/maxRating**: Optional integers between 1 and 5

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
- **400 Bad Request**: Invalid input data, validation errors
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Rating or listing not found
- **409 Conflict**: Duplicate rating attempt
- **500 Internal Server Error**: Database or server errors

## Integration Examples

### Frontend Integration
```javascript
// Create a rating
const createRating = async (listingId, rating, comment) => {
  const response = await fetch('/api/ratings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      listingId,
      rating,
      comment
    })
  });
  
  return response.json();
};

// Get listing ratings
const getListingRatings = async (listingId, page = 1) => {
  const response = await fetch(
    `/api/ratings/listing/${listingId}?page=${page}&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    }
  );
  
  return response.json();
};

// Check if user can rate
const canUserRate = async (listingId) => {
  const response = await fetch(
    `/api/ratings/can-rate/${listingId}`,
    {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    }
  );
  
  return response.json();
};
```

### Service Integration
```typescript
// In listing service
import { RatingService } from './rating.service';

class ListingService {
  private ratingService = new RatingService();

  async getListingWithRatings(listingId: number) {
    const listing = await this.getListingById(listingId);
    const ratingStats = await this.ratingService.getListingRatingStats(listingId);
    
    return {
      ...listing,
      ratingStats
    };
  }
}
```

## Testing

### Unit Tests (`src/tests/rating.test.ts`)
- **Service Methods**: All rating service methods tested
- **Business Logic**: Rating rules and validations tested
- **Edge Cases**: Error conditions and boundary cases
- **Database Operations**: CRUD operations verified
- **Aggregate Updates**: Listing rating updates tested

### Test Coverage
- ✅ Rating creation with valid data
- ✅ Self-rating prevention
- ✅ Duplicate rating prevention
- ✅ Rating validation (1-5 range)
- ✅ Rating updates and deletions
- ✅ Permission checks
- ✅ Aggregate calculations
- ✅ Pagination and filtering
- ✅ Error handling

### Running Tests
```bash
# Run all tests
npm test

# Run rating tests specifically
npm test -- --testNamePattern="RatingService"

# Run tests with coverage
npm test -- --coverage
```

## Performance Considerations

### Database Optimization
- **Indexes**: Strategic indexes on frequently queried columns
- **Aggregates**: Pre-calculated rating statistics stored with listings
- **Pagination**: Efficient pagination for large datasets
- **Query Optimization**: Optimized queries for rating statistics

### Caching Strategy
- **Listing Aggregates**: Rating averages cached in listing table
- **Statistics**: Rating distribution cached for popular listings
- **Query Results**: Frequently accessed ratings cached in Redis

### Scaling Considerations
- **Batch Updates**: Efficient bulk rating operations
- **Read Replicas**: Separate read/write database connections
- **Async Processing**: Background jobs for aggregate updates
- **Rate Limiting**: API rate limits to prevent abuse

## Security Considerations

### Authentication & Authorization
- **JWT Validation**: All endpoints require valid JWT tokens
- **User Ownership**: Users can only modify their own ratings
- **Permission Checks**: Proper authorization for all operations

### Data Validation
- **Input Sanitization**: All inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries used
- **XSS Prevention**: Comment content properly escaped
- **Rate Limiting**: API endpoints rate-limited

### Privacy Protection
- **User Data**: Minimal user information exposed in ratings
- **Soft Deletes**: Ratings preserved for audit purposes
- **Data Retention**: Configurable data retention policies

## Monitoring & Analytics

### Logging
```typescript
// Rating creation logging
console.log('⭐ Rating created:', {
  userId,
  listingId,
  rating,
  timestamp: new Date()
});

// Rating statistics logging
console.log('📊 Rating stats updated:', {
  listingId,
  averageRating,
  totalRatings
});
```

### Metrics to Track
- **Rating Volume**: Number of ratings created per day/week
- **Rating Distribution**: Distribution of 1-5 star ratings
- **User Engagement**: Percentage of users who rate listings
- **Listing Coverage**: Percentage of listings with ratings
- **Average Rating Trends**: Changes in average ratings over time

## Future Enhancements

### Planned Features
1. **Rating Replies**: Allow listing owners to respond to ratings
2. **Helpful Votes**: Users can vote on rating helpfulness
3. **Rating Moderation**: Admin tools for managing inappropriate ratings
4. **Advanced Analytics**: Detailed rating analytics dashboard
5. **Rating Notifications**: Push notifications for new ratings
6. **Bulk Operations**: Admin tools for bulk rating management

### API Extensions
1. **Rating Filters**: Filter ratings by date, rating value, user type
2. **Rating Search**: Search ratings by comment content
3. **Rating Export**: Export rating data for analysis
4. **Rating Trends**: API endpoints for rating trend analysis

## Support & Troubleshooting

### Common Issues

#### Rating Not Appearing
- Check if rating is active (`isActive = true`)
- Verify listing exists and is active
- Confirm user has permission to view ratings

#### Cannot Create Rating
- Verify user is authenticated
- Check if user already rated the listing
- Ensure listing is not owned by the user
- Validate rating is between 1-5

#### Aggregate Not Updating
- Check if `updateListingRatingAggregates` is called
- Verify listing exists in database
- Ensure rating operations are successful

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` for comprehensive error information and query logs.

---

**Note**: This rating system provides a robust foundation for user feedback in the Sirkulo marketplace. The implementation is designed to be scalable, secure, and maintainable for production use while providing excellent user experience.