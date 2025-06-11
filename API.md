# GrowStack API Documentation

## Authentication

### Register User
```http
POST /api/auth/register
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "referralCode": "optional-referral-code"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "onboardingStep": "signup",
      "kycStatus": "pending"
    },
    "token": "jwt-token"
  }
}
```

### Login
```http
POST /api/auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token"
  }
}
```

## User Management

### Get User Profile
```http
GET /api/users/profile
```

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "onboardingStep": "signup",
    "kycStatus": "pending",
    "referralCode": "user-referral-code",
    "referredBy": "referrer-id",
    "lastActive": "2024-03-20T12:00:00Z"
  }
}
```

### Update User Profile
```http
PUT /api/users/profile
```

Headers:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

Response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
}
```

## Referrals

### Get Referral Stats
```http
GET /api/referrals/stats
```

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalReferrals": 10,
    "activeReferrals": 5,
    "completedReferrals": 3,
    "pendingReferrals": 2,
    "totalRewards": 150.00,
    "recentReferrals": [
      {
        "id": "uuid",
        "referrerId": "uuid",
        "referredId": "uuid",
        "status": "active",
        "rewardAmount": 50.00,
        "createdAt": "2024-03-20T12:00:00Z"
      }
    ]
  }
}
```

### Get Referral Link
```http
GET /api/referrals/link
```

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "referralCode": "user-referral-code",
    "referralLink": "https://growstack.com/ref/user-referral-code"
  }
}
```

## Onboarding

### Update Onboarding Step
```http
POST /api/onboarding/step
```

Headers:
```
Authorization: Bearer <token>
```

Request body:
```json
{
  "step": "kyc",
  "metadata": {
    "documentType": "passport",
    "documentNumber": "AB123456"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Onboarding step updated",
  "data": {
    "id": "uuid",
    "onboardingStep": "kyc",
    "updatedAt": "2024-03-20T12:00:00Z"
  }
}
```

### Get Onboarding Stats (Admin)
```http
GET /api/onboarding/stats?startDate=2024-03-01&endDate=2024-03-20
```

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "usersByStep": {
      "signup": 30,
      "kyc": 40,
      "completed": 30
    },
    "dropOffs": {
      "signup_to_kyc": 20,
      "kyc_to_completed": 10
    }
  }
}
```

## Notifications

### Get User Notifications
```http
GET /api/notifications
```

Headers:
```
Authorization: Bearer <token>
```

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (read/unread)

Response:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "onboarding",
        "channel": "email",
        "status": "unread",
        "title": "Complete your profile",
        "content": "Please complete your profile to continue",
        "createdAt": "2024-03-20T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    }
  }
}
```

### Mark Notification as Read
```http
PUT /api/notifications/:id/read
```

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "uuid",
    "status": "read",
    "updatedAt": "2024-03-20T12:00:00Z"
  }
}
```

## Analytics (Admin Only)

### Get User Analytics
```http
GET /api/analytics/users?startDate=2024-03-01&endDate=2024-03-20
```

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "activeUsers": 80,
    "newUsers": 20,
    "usersByRole": {
      "user": 90,
      "admin": 10
    },
    "usersByStatus": {
      "active": 80,
      "blocked": 5,
      "pending": 15
    }
  }
}
```

### Get Event Analytics
```http
GET /api/analytics/events?startDate=2024-03-01&endDate=2024-03-20
```

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalEvents": 500,
    "eventsByType": {
      "signup": 100,
      "login": 200,
      "kyc_completed": 50,
      "referral_created": 150
    },
    "eventsByDay": {
      "2024-03-01": 50,
      "2024-03-02": 60
    }
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "Error message"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
``` 