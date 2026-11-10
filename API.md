# API Reference

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

---

## 🔐 Auth Endpoints

### Register
\`\`\`http
POST /auth/register
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "customer", // or "provider"
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe",
    "isApproved": true
  }
}
\`\`\`

### Login
\`\`\`http
POST /auth/login
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "admin@marketplace.com",
  "password": "admin123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@marketplace.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  }
}
\`\`\`

### Get Current User
\`\`\`http
GET /auth/me
\`\`\`

**Headers:** `Authorization: Bearer <token>`

**Response:**
\`\`\`json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
\`\`\`

---

## 👨‍💼 Admin Endpoints

**All admin endpoints require admin role authentication**

### Get Dashboard Stats
\`\`\`http
GET /admin/dashboard
\`\`\`

**Response:**
\`\`\`json
{
  "stats": {
    "total_providers": 45,
    "total_customers": 230,
    "total_bookings": 180,
    "pending_bookings": 12,
    "completed_bookings": 150,
    "active_services": 120,
    "total_reviews": 95,
    "pending_approvals": 3
  },
  "recentBookings": [...],
  "topProviders": [...]
}
\`\`\`

### Get All Providers
\`\`\`http
GET /admin/providers?page=1&limit=20&status=pending&search=business
\`\`\`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `status` (optional) - pending | approved
- `search` (optional) - Search term

**Response:**
\`\`\`json
{
  "providers": [...],
  "total": 45,
  "page": 1,
  "totalPages": 3
}
\`\`\`

### Approve/Reject Provider
\`\`\`http
PATCH /admin/providers/:id/status
\`\`\`

**Request Body:**
\`\`\`json
{
  "isApproved": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Provider approved successfully"
}
\`\`\`

### Get All Customers
\`\`\`http
GET /admin/customers?page=1&limit=20&search=john
\`\`\`

**Response:**
\`\`\`json
{
  "customers": [...],
  "total": 230,
  "page": 1,
  "totalPages": 12
}
\`\`\`

### Get All Bookings
\`\`\`http
GET /admin/bookings?status=pending&search=john
\`\`\`

**Query Parameters:**
- `status` (optional) - pending | approved | completed | cancelled
- `search` (optional) - Search term

**Response:**
\`\`\`json
{
  "bookings": [...],
  "total": 180,
  "page": 1,
  "totalPages": 9
}
\`\`\`

### Toggle User Status
\`\`\`http
PATCH /admin/users/:id/toggle-status
\`\`\`

**Request Body:**
\`\`\`json
{
  "isActive": false
}
\`\`\`

---

## 🏪 Provider Endpoints

**All provider endpoints require provider role authentication**

### Get Provider Profile
\`\`\`http
GET /provider/profile
\`\`\`

**Response:**
\`\`\`json
{
  "id": "uuid",
  "user_id": "uuid",
  "business_name": "ABC Services",
  "business_description": "We provide...",
  "address": "123 Main St",
  "suburb": "Downtown",
  "city": "New York",
  "rating": 4.5,
  "total_reviews": 25,
  "email": "provider@example.com",
  "phone": "+1234567890"
}
\`\`\`

### Update Provider Profile
\`\`\`http
PATCH /provider/profile
\`\`\`

**Request Body:**
\`\`\`json
{
  "businessName": "ABC Services Ltd",
  "businessDescription": "Updated description",
  "address": "456 New St",
  "suburb": "Uptown",
  "city": "New York",
  "specialties": ["Plumbing", "Electrical"]
}
\`\`\`

### Get Provider Services
\`\`\`http
GET /provider/services
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": "uuid",
    "name": "Home Cleaning",
    "description": "Professional home cleaning",
    "price": 50.00,
    "duration": 120,
    "category_name": "Home Services",
    "is_active": true
  }
]
\`\`\`

### Create Service
\`\`\`http
POST /provider/services
\`\`\`

**Request Body:**
\`\`\`json
{
  "categoryId": "uuid",
  "name": "Deep Cleaning",
  "description": "Thorough deep cleaning service",
  "price": 100.00,
  "duration": 180,
  "serviceAreas": ["Downtown", "Uptown"],
  "images": ["url1", "url2"]
}
\`\`\`

### Update Service
\`\`\`http
PATCH /provider/services/:id
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "Updated Service Name",
  "price": 75.00,
  "isActive": false
}
\`\`\`

### Delete Service
\`\`\`http
DELETE /provider/services/:id
\`\`\`

### Get Provider Bookings
\`\`\`http
GET /provider/bookings?status=pending
\`\`\`

**Query Parameters:**
- `status` (optional) - Filter by status

**Response:**
\`\`\`json
[
  {
    "id": "uuid",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "service_name": "Home Cleaning",
    "booking_date": "2026-01-15",
    "booking_time": "10:00",
    "status": "pending",
    "total_price": 50.00
  }
]
\`\`\`

### Update Booking Status
\`\`\`http
PATCH /provider/bookings/:id/status
\`\`\`

**Request Body:**
\`\`\`json
{
  "status": "approved" // or "rejected", "in_progress", "completed"
}
\`\`\`

### Get Provider Reviews
\`\`\`http
GET /provider/reviews
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": "uuid",
    "customer_name": "John Doe",
    "rating": 5,
    "comment": "Excellent service!",
    "provider_response": null,
    "created_at": "2026-01-03T10:00:00Z"
  }
]
\`\`\`

### Respond to Review
\`\`\`http
POST /provider/reviews/:id/respond
\`\`\`

**Request Body:**
\`\`\`json
{
  "response": "Thank you for your feedback!"
}
\`\`\`

---

## 👥 Customer Endpoints

### Get Categories (Public)
\`\`\`http
GET /customer/categories
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": "uuid",
    "name": "Home Services",
    "slug": "home-services",
    "description": "All home-related services"
  }
]
\`\`\`

### Search Providers (Public)
\`\`\`http
GET /customer/providers/search?search=clean&suburb=downtown&categoryId=uuid&minRating=4
\`\`\`

**Query Parameters:**
- `search` (optional) - Search term
- `suburb` (optional) - Filter by suburb
- `categoryId` (optional) - Filter by category
- `minRating` (optional) - Minimum rating filter
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:**
\`\`\`json
{
  "providers": [
    {
      "id": "uuid",
      "business_name": "ABC Cleaning",
      "business_description": "Professional cleaning",
      "suburb": "Downtown",
      "city": "New York",
      "rating": 4.5,
      "total_reviews": 25,
      "total_bookings": 150
    }
  ],
  "total": 10,
  "page": 1,
  "totalPages": 1
}
\`\`\`

### Get Provider by ID (Public)
\`\`\`http
GET /customer/providers/:id
\`\`\`

**Response:**
\`\`\`json
{
  "provider": {...},
  "services": [...],
  "reviews": [...]
}
\`\`\`

### Create Booking (Auth Required)
\`\`\`http
POST /customer/bookings
\`\`\`

**Request Body:**
\`\`\`json
{
  "providerId": "uuid",
  "serviceId": "uuid",
  "bookingDate": "2026-01-15",
  "bookingTime": "10:00",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1234567890",
  "address": "789 Customer St",
  "suburb": "Midtown",
  "notes": "Please call before arriving",
  "totalPrice": 50.00
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Booking created successfully",
  "booking": {...}
}
\`\`\`

### Get Customer Bookings (Auth Required)
\`\`\`http
GET /customer/bookings
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": "uuid",
    "provider_name": "ABC Cleaning",
    "service_name": "Home Cleaning",
    "booking_date": "2026-01-15",
    "status": "approved",
    "total_price": 50.00
  }
]
\`\`\`

### Cancel Booking (Auth Required)
\`\`\`http
PATCH /customer/bookings/:id/cancel
\`\`\`

**Request Body:**
\`\`\`json
{
  "reason": "Schedule conflict"
}
\`\`\`

### Create Review (Auth Required)
\`\`\`http
POST /customer/reviews
\`\`\`

**Request Body:**
\`\`\`json
{
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Excellent service! Very professional."
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Review submitted successfully",
  "review": {...}
}
\`\`\`

### Get Services by Category (Public)
\`\`\`http
GET /customer/categories/:categoryId/services
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": "uuid",
    "name": "Home Cleaning",
    "price": 50.00,
    "business_name": "ABC Cleaning",
    "rating": 4.5,
    "suburb": "Downtown"
  }
]
\`\`\`

---

## 🔒 Error Responses

### 400 Bad Request
\`\`\`json
{
  "message": "Validation error message"
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "message": "No token provided" // or "Invalid token"
}
\`\`\`

### 403 Forbidden
\`\`\`json
{
  "message": "You do not have permission to perform this action"
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "message": "Resource not found"
}
\`\`\`

### 500 Server Error
\`\`\`json
{
  "message": "Server error",
  "error": "Detailed error (development only)"
}
\`\`\`

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- UUIDs are used for all IDs
- Pagination defaults: page=1, limit=20
- All prices are in USD (decimal format)
- Ratings are 1-5 (integer)
- Status values are lowercase strings

---

## 🧪 Testing with cURL

**Login:**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@marketplace.com","password":"admin123"}'
\`\`\`

**Get Dashboard (with token):**
\`\`\`bash
curl -X GET http://localhost:5000/api/admin/dashboard \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

**Search Providers:**
\`\`\`bash
curl -X GET "http://localhost:5000/api/customer/providers/search?suburb=downtown"
\`\`\`

---

For Postman collection, import the provided JSON file (if available).
