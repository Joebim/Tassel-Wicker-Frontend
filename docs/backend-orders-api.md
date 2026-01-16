# Orders API Documentation

## Overview

This document describes the backend API endpoints for order management. Orders can be created by both authenticated users and guests, and admin users can manage orders.

## Base URL

```
/api/orders
```

## Authentication

**User Endpoints:**
- `POST /api/orders` - Create order (authentication optional, supports guest checkout)
- `GET /api/orders/my` - Get user's orders (authentication required)
- `GET /api/orders/:id` - Get specific order (authentication required, owner or admin only)

**Admin Endpoints:**
- `GET /api/orders/admin/list` - List all orders (authentication required, admin/moderator role)
- `PATCH /api/orders/admin/:id` - Update order (authentication required, admin/moderator role)

For authenticated endpoints, include JWT token:

```
Authorization: Bearer <token>
```

## Data Structures

### OrderItem

```typescript
interface OrderItem {
  productId: string; // Product ID
  productName: string; // Product name
  productImage: string; // Product image URL
  price: number; // Item price (non-negative)
  quantity: number; // Quantity (positive integer)
  total: number; // Total price for this item (non-negative)
}
```

### Address

```typescript
interface Address {
  firstName: string; // First name (required)
  lastName: string; // Last name (required)
  company?: string; // Company name (optional)
  address1: string; // Address line 1 (required)
  address2?: string; // Address line 2 (optional)
  city: string; // City (required)
  state: string; // State/Province (required)
  postalCode: string; // Postal code (required)
  country: string; // Country (required)
  phone?: string; // Phone number (optional)
}
```

### ShippingInfo

```typescript
interface ShippingInfo extends Address {
  method: string; // Shipping method (required)
  cost: number; // Shipping cost (non-negative)
  trackingNumber?: string; // Tracking number (optional)
}
```

### PaymentInfo

```typescript
interface PaymentInfo {
  method: string; // Payment method (required)
  status: "pending" | "paid" | "failed" | "refunded"; // Payment status (default: "pending")
  transactionId?: string; // Transaction ID (optional)
  stripePaymentIntentId?: string; // Stripe payment intent ID (optional)
  stripeCheckoutSessionId?: string; // Stripe checkout session ID (optional)
}
```

### Totals

```typescript
interface Totals {
  subtotal: number; // Subtotal before shipping, tax, discount (non-negative)
  shipping: number; // Shipping cost (non-negative)
  tax: number; // Tax amount (non-negative)
  discount: number; // Discount amount (non-negative)
  total: number; // Grand total (non-negative)
}
```

### Order

```typescript
interface Order {
  id: string; // Order ID
  orderNumber: string; // Unique order number (e.g., "TW-ABC123-XYZ789")
  userId?: string; // User ID (if authenticated user)
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"; // Order status
  items: OrderItem[]; // Array of order items
  shipping: ShippingInfo; // Shipping information
  billing: Address; // Billing address
  payment: PaymentInfo; // Payment information
  totals: Totals; // Order totals
  notes?: string; // Order notes (optional, max 10000 characters)
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  shippedAt?: string; // ISO 8601 timestamp (set when status becomes "shipped")
  deliveredAt?: string; // ISO 8601 timestamp (set when status becomes "delivered")
}
```

## Endpoints

### 1. Create Order (User Endpoint)

Create a new order. This endpoint can be used by both authenticated users and guests. Stock validation and decrement happens automatically for products that exist in the database.

**Endpoint:** `POST /api/orders`

**Authentication:** Optional (supports guest checkout)

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <token> (optional)
```

**Request Body:**

```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Artisan Wicker Basket",
      "productImage": "https://example.com/image.jpg",
      "price": 89.99,
      "quantity": 2,
      "total": 179.98
    }
  ],
  "shipping": {
    "firstName": "John",
    "lastName": "Doe",
    "company": "Acme Corp",
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "phone": "+1-555-0123",
    "method": "Standard Shipping",
    "cost": 10.00,
    "trackingNumber": null
  },
  "billing": {
    "firstName": "John",
    "lastName": "Doe",
    "address1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "payment": {
    "method": "credit_card",
    "status": "paid",
    "transactionId": "txn_123456",
    "stripePaymentIntentId": "pi_1234567890"
  },
  "totals": {
    "subtotal": 179.98,
    "shipping": 10.00,
    "tax": 15.20,
    "discount": 0.00,
    "total": 205.18
  },
  "notes": "Please leave package at front door"
}
```

**Response:**

```json
{
  "item": {
    "id": "507f1f77bcf86cd799439012",
    "orderNumber": "TW-L9K2M-XYZ789",
    "userId": "507f1f77bcf86cd799439013",
    "status": "pending",
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Artisan Wicker Basket",
        "productImage": "https://example.com/image.jpg",
        "price": 89.99,
        "quantity": 2,
        "total": 179.98
      }
    ],
    "shipping": {
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Corp",
      "address1": "123 Main St",
      "address2": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US",
      "phone": "+1-555-0123",
      "method": "Standard Shipping",
      "cost": 10.00,
      "trackingNumber": null
    },
    "billing": {
      "firstName": "John",
      "lastName": "Doe",
      "address1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "US"
    },
    "payment": {
      "method": "credit_card",
      "status": "paid",
      "transactionId": "txn_123456",
      "stripePaymentIntentId": "pi_1234567890"
    },
    "totals": {
      "subtotal": 179.98,
      "shipping": 10.00,
      "tax": 15.20,
      "discount": 0.00,
      "total": 205.18
    },
    "notes": "Please leave package at front door",
    "createdAt": "2025-12-17T10:00:00Z",
    "updatedAt": "2025-12-17T10:00:00Z"
  }
}
```

**Status Codes:**

- `201 Created` - Order created successfully
- `400 Bad Request` - Invalid request data or total/subtotal mismatch
- `409 Conflict` - Insufficient stock for one or more products

**Validation:**

- `items` array must contain at least one item
- All totals must be non-negative numbers
- `subtotal` must match the sum of `price * quantity` for all items (within 0.01 tolerance)
- `total` must match `subtotal + shipping + tax - discount` (within 0.01 tolerance)
- Stock validation: If a product exists in the database, stock quantity must be sufficient
- Stock decrement: Product stock is automatically decremented if the product exists in the database

**Order Number Generation:**

- Order numbers are automatically generated in the format: `TW-{timestamp}-{random}`
- Example: `TW-L9K2M-XYZ789`
- Guaranteed to be unique

**Activity Logging:**

- Order creation is logged as `order.created` activity
- If payment status is "paid", an additional `order.payment_received` activity is logged

**Notes:**

- If user is authenticated, `userId` is automatically set from the token
- If user is not authenticated, `userId` will be `null` (guest order)
- Stock validation only applies to products that exist in the database and have valid MongoDB ObjectIds
- Stock decrement uses atomic update to prevent race conditions

---

### 2. Get All Orders (Admin Endpoint)

Retrieve a paginated list of all orders. Only accessible by admin or moderator users.

**Endpoint:** `GET /api/orders/admin/list`

**Authentication:** Required (Admin or Moderator role)

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (number, optional) - Page number (default: 1, minimum: 1)
- `limit` (number, optional) - Items per page (default: 20, minimum: 1, maximum: 100)

**Response:**

```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439012",
      "orderNumber": "TW-L9K2M-XYZ789",
      "userId": "507f1f77bcf86cd799439013",
      "status": "pending",
      "items": [...],
      "shipping": {...},
      "billing": {...},
      "payment": {...},
      "totals": {...},
      "createdAt": "2025-12-17T10:00:00Z",
      "updatedAt": "2025-12-17T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 150,
  "totalPages": 8
}
```

**Status Codes:**

- `200 OK` - Orders retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User doesn't have admin/moderator permission

**Notes:**

- Results are sorted by `createdAt` in descending order (most recent first)
- Pagination uses 1-based page numbers
- Maximum limit is 100 items per page
- Response includes pagination metadata: `page`, `limit`, `total`, `totalPages`

**Example Request:**

```bash
# Get first page (default)
curl -H "Authorization: Bearer <token>" https://api.example.com/api/orders/admin/list

# Get specific page with custom limit
curl -H "Authorization: Bearer <token>" "https://api.example.com/api/orders/admin/list?page=2&limit=50"
```

---

### 3. Get User's Orders

Retrieve all orders for the authenticated user.

**Endpoint:** `GET /api/orders/my`

**Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "items": [
    {
      "id": "507f1f77bcf86cd799439012",
      "orderNumber": "TW-L9K2M-XYZ789",
      "userId": "507f1f77bcf86cd799439013",
      "status": "pending",
      "items": [...],
      "shipping": {...},
      "billing": {...},
      "payment": {...},
      "totals": {...},
      "createdAt": "2025-12-17T10:00:00Z",
      "updatedAt": "2025-12-17T10:00:00Z"
    }
  ]
}
```

**Status Codes:**

- `200 OK` - Orders retrieved successfully
- `401 Unauthorized` - Invalid or missing token

**Notes:**

- Returns up to 100 most recent orders for the user
- Results are sorted by `createdAt` in descending order (most recent first)
- Only returns orders where `userId` matches the authenticated user

---

### 4. Get Order by ID

Retrieve a specific order by ID. Users can only access their own orders, while admins can access any order.

**Endpoint:** `GET /api/orders/:id`

**Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**Path Parameters:**

- `id` (string, required) - Order ID (MongoDB ObjectId)

**Response:**

```json
{
  "item": {
    "id": "507f1f77bcf86cd799439012",
    "orderNumber": "TW-L9K2M-XYZ789",
    "userId": "507f1f77bcf86cd799439013",
    "status": "pending",
    "items": [...],
    "shipping": {...},
    "billing": {...},
    "payment": {...},
    "totals": {...},
    "createdAt": "2025-12-17T10:00:00Z",
    "updatedAt": "2025-12-17T10:00:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Order retrieved successfully
- `400 Bad Request` - Invalid order ID format
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User doesn't have permission to access this order
- `404 Not Found` - Order not found

**Access Control:**

- Users can only access orders where they are the owner (`userId` matches authenticated user)
- Admin and moderator users can access any order
- If order has no `userId` (guest order), only admins can access it

---

### 5. Update Order (Admin Endpoint)

Update an order's status and tracking information. Only accessible by admin or moderator users.

**Endpoint:** `PATCH /api/orders/admin/:id`

**Authentication:** Required (Admin or Moderator role)

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Path Parameters:**

- `id` (string, required) - Order ID (MongoDB ObjectId)

**Request Body:**

```json
{
  "status": "shipped",
  "trackingNumber": "1Z999AA10123456784"
}
```

**Status Values:**

- `pending` - Order is pending
- `confirmed` - Order is confirmed
- `processing` - Order is being processed
- `shipped` - Order has been shipped (automatically sets `shippedAt` timestamp)
- `delivered` - Order has been delivered (automatically sets `deliveredAt` timestamp)
- `cancelled` - Order has been cancelled
- `refunded` - Order has been refunded

**Response:**

```json
{
  "item": {
    "id": "507f1f77bcf86cd799439012",
    "orderNumber": "TW-L9K2M-XYZ789",
    "userId": "507f1f77bcf86cd799439013",
    "status": "shipped",
    "items": [...],
    "shipping": {
      "...": "...",
      "trackingNumber": "1Z999AA10123456784"
    },
    "billing": {...},
    "payment": {...},
    "totals": {...},
    "createdAt": "2025-12-17T10:00:00Z",
    "updatedAt": "2025-12-17T10:30:00Z",
    "shippedAt": "2025-12-17T10:30:00Z"
  }
}
```

**Status Codes:**

- `200 OK` - Order updated successfully
- `400 Bad Request` - Invalid order ID or request data
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User doesn't have admin/moderator permission
- `404 Not Found` - Order not found

**Notes:**

- Both `status` and `trackingNumber` are optional - you can update either or both
- When status is set to `shipped`, the `shippedAt` timestamp is automatically set
- When status is set to `delivered`, the `deliveredAt` timestamp is automatically set
- Tracking number is stored in `shipping.trackingNumber`
- Order update is logged as `order.updated` activity
- If status is changed to `cancelled`, an additional `order.cancelled` activity is logged

**Example Request:**

```bash
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped","trackingNumber":"1Z999AA10123456784"}' \
  https://api.example.com/api/orders/admin/507f1f77bcf86cd799439012
```

---

## Database Schema (MongoDB)

### Order Collection

```javascript
{
  _id: ObjectId,
  orderNumber: String,           // Unique order number (indexed)
  userId: ObjectId,              // User ID (optional, indexed, ref: "User")
  status: String,                // Order status (enum)
  items: [{
    productId: String,
    productName: String,
    productImage: String,
    price: Number,
    quantity: Number,
    total: Number
  }],
  shipping: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String,
    method: String,
    cost: Number,
    trackingNumber: String
  },
  billing: {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  payment: {
    method: String,
    status: String,              // enum: "pending", "paid", "failed", "refunded"
    transactionId: String,
    last4: String,
    brand: String,
    paidAt: Date,
    stripePaymentIntentId: String, // indexed
    stripeCheckoutSessionId: String // indexed
  },
  totals: {
    subtotal: Number,
    shipping: Number,
    tax: Number,
    discount: Number,
    total: Number
  },
  notes: String,
  shippedAt: Date,
  deliveredAt: Date,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
db.orders.createIndex({ userId: 1 })
db.orders.createIndex({ createdAt: -1 })
db.orders.createIndex({ "payment.stripePaymentIntentId": 1 })
db.orders.createIndex({ "payment.stripeCheckoutSessionId": 1 })
```

## Implementation Notes

1. **Stock Management:**
   - Stock validation only applies to products that exist in the database with valid MongoDB ObjectIds
   - Stock is decremented atomically using MongoDB update with conditions to prevent race conditions
   - If a product doesn't exist in the database, stock validation is skipped (allows for external products)

2. **Order Number Generation:**
   - Format: `TW-{timestamp}-{random}`
   - Timestamp is base36-encoded current timestamp
   - Random component is 8 hex characters
   - Guaranteed unique through database unique index

3. **Guest Orders:**
   - Orders can be created without authentication (`userId` will be `null`)
   - Guest orders can only be accessed by admin users

4. **Activity Logging:**
   - Order creation is logged with metadata (orderId, orderNumber, total, itemCount, paymentMethod)
   - Payment received is logged separately if payment status is "paid"
   - Order updates are logged with status changes
   - Order cancellations are logged separately

5. **Price Validation:**
   - Subtotals and totals are validated on order creation
   - Uses epsilon comparison (0.01) to handle floating-point precision issues
   - Returns 400 error if totals don't match calculated values

6. **Status Transitions:**
   - Status can be updated by admin users
   - `shipped` status automatically sets `shippedAt` timestamp
   - `delivered` status automatically sets `deliveredAt` timestamp

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for Artisan Wicker Basket",
    "details": {}
  }
}
```

Common error codes:

- `BadRequest` - Invalid request data or validation failed
- `Conflict` - Insufficient stock for one or more products
- `NotFound` - Order not found
- `Forbidden` - User doesn't have permission to access resource
- `Unauthorized` - Invalid or missing authentication token

## Rate Limiting

- Order creation: 20 requests per minute per user/IP
- Order retrieval: 100 requests per minute per user
- Admin endpoints: 50 requests per minute per user

## Example Usage

### Frontend Example (React/TypeScript)

```typescript
// Create order
async function createOrder(orderData: CreateOrderRequest, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData)
  });
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  return response.json();
}

// Get user's orders
async function getMyOrders(token: string) {
  const response = await fetch('/api/orders/my', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

// Get all orders (admin)
async function getAllOrders(token: string, page = 1, limit = 20) {
  const response = await fetch(`/api/orders/admin/list?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

// Update order (admin)
async function updateOrder(orderId: string, updates: UpdateOrderRequest, token: string) {
  const response = await fetch(`/api/orders/admin/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    throw new Error('Failed to update order');
  }
  return response.json();
}
```

### cURL Examples

```bash
# Create order (guest)
curl -X POST \
  -H "Content-Type: application/json" \
  -d @order.json \
  https://api.example.com/api/orders

# Create order (authenticated)
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @order.json \
  https://api.example.com/api/orders

# Get user's orders
curl -H "Authorization: Bearer <token>" \
  https://api.example.com/api/orders/my

# Get all orders (admin)
curl -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/orders/admin/list?page=1&limit=20"

# Get order by ID
curl -H "Authorization: Bearer <token>" \
  https://api.example.com/api/orders/507f1f77bcf86cd799439012

# Update order (admin)
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"shipped","trackingNumber":"1Z999AA10123456784"}' \
  https://api.example.com/api/orders/admin/507f1f77bcf86cd799439012
```
