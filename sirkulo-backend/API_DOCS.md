# Sirkulo Authentication API Documentation

## Base URL
```
http://localhost:3000/api/auth
```

## Endpoints

### 1. User Registration
**POST** `/signup`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "roles": ["user", "recycler"],
  "activeMode": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["user", "recycler"],
      "activeMode": "user",
      "verificationStatus": "pending",
      "emailVerified": false,
      "isActive": true,
      "createdAt": "2025-01-24T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 2. User Login
**POST** `/login`

Authenticate user and get access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["user", "recycler"],
      "activeMode": "user",
      "lastLoginAt": "2025-01-24T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 3. Refresh Token
**POST** `/refresh`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 4. Switch User Mode
**POST** `/switch-mode`

Switch between user modes (user/recycler/business).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "mode": "recycler"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mode switched to recycler successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "activeMode": "recycler",
      "roles": ["user", "recycler"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 5. Get Current User Profile
**GET** `/me`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "roles": ["user", "recycler"],
      "activeMode": "recycler",
      "verificationStatus": "verified",
      "emailVerified": true,
      "isActive": true,
      "createdAt": "2025-01-24T10:00:00Z",
      "updatedAt": "2025-01-24T10:30:00Z"
    }
  }
}
```

### 6. Forgot Password
**POST** `/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

### 7. Reset Password
**POST** `/reset-password`

Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewStrongPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 8. Verify Email
**GET** `/verify-email/:token`

Verify user email using token from email.

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 9. Logout
**POST** `/logout`

Logout user (client should remove tokens).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

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
- `201` - Created (successful registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## User Roles

- `user` - Default user role for buyers
- `recycler` - For users who provide upcycling services
- `business` - For waste sellers with analytics access
- `admin` - System administrators

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

Access tokens expire in 24 hours by default. Use the refresh token to get new access tokens.
