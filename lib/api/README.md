# API Implementation Guide

This directory contains the implementation of Cart and Content Management APIs based on the backend documentation.

## Structure

```
lib/api/
├── auth.ts          # Authentication middleware
├── errors.ts        # Error handling utilities
├── validation.ts    # Validation functions
├── db.ts            # Database abstraction layer
└── README.md        # This file

app/api/
├── cart/
│   ├── route.ts              # GET, DELETE /api/cart
│   ├── guest/route.ts        # GET /api/cart/guest
│   ├── items/
│   │   ├── route.ts          # POST /api/cart/items
│   │   └── [itemId]/route.ts # PUT, DELETE /api/cart/items/:itemId
│   ├── sync/route.ts         # POST /api/cart/sync
│   └── merge-guest/route.ts  # POST /api/cart/merge-guest
└── content/
    ├── route.ts              # GET /api/content
    ├── [page]/route.ts       # GET, PUT /api/content/:page
    ├── public/
    │   └── [page]/route.ts   # GET /api/content/public/:page
    └── upload/route.ts       # POST /api/content/upload
```

## Implementation Status

### ✅ Completed

1. **Authentication Middleware** (`lib/api/auth.ts`)

   - Token extraction
   - Token verification (placeholder - needs implementation)
   - Admin access checking

2. **Error Handling** (`lib/api/errors.ts`)

   - Standardized error responses
   - Error codes for cart and content APIs

3. **Validation** (`lib/api/validation.ts`)

   - Page validation
   - About page content validation
   - Cart item validation
   - File upload validation

4. **Type Definitions**

   - `types/cart.ts` - Cart-related types
   - `types/content.ts` - Content-related types

5. **Cart API Routes**

   - GET /api/cart - Get user cart
   - DELETE /api/cart - Clear cart
   - GET /api/cart/guest - Get guest cart
   - POST /api/cart/items - Add item to cart
   - PUT /api/cart/items/:itemId - Update item quantity
   - DELETE /api/cart/items/:itemId - Remove item
   - POST /api/cart/sync - Sync carts
   - POST /api/cart/merge-guest - Merge guest cart

6. **Content API Routes**
   - GET /api/content/:page - Get content (admin)
   - PUT /api/content/:page - Update content
   - GET /api/content/public/:page - Get public content
   - GET /api/content - Get all content (admin)
   - POST /api/content/upload - Upload PDF

### ⚠️ Needs Implementation

1. **Database Layer** (`lib/api/db.ts`)

   - All database operations are placeholders
   - Need to implement with actual MongoDB/PostgreSQL queries
   - Connect to your database and implement all methods

2. **Authentication** (`lib/api/auth.ts`)

   - `verifyToken()` function needs actual JWT verification
   - Should decode token and fetch user from database
   - Implement based on your auth system

3. **File Upload** (`app/api/content/upload/route.ts`)

   - Currently returns placeholder URL
   - Need to implement actual upload to Cloudinary/S3/etc.
   - Follow the documentation for Cloudinary implementation

4. **Product Validation**
   - Cart routes need to validate products exist
   - Check product stock availability
   - Verify product prices

## Next Steps

1. **Set up Database Connection**

   ```typescript
   // Example MongoDB connection
   import mongoose from "mongoose";
   await mongoose.connect(process.env.MONGODB_URI!);
   ```

2. **Implement Database Models**

   ```typescript
   // Create Cart and Content Mongoose models
   // Based on the schema in the documentation
   ```

3. **Implement JWT Verification**

   ```typescript
   // In lib/api/auth.ts
   import jwt from "jsonwebtoken";
   const decoded = jwt.verify(token, process.env.JWT_SECRET!);
   const user = await User.findById(decoded.userId);
   ```

4. **Implement File Upload**

   ```typescript
   // In app/api/content/upload/route.ts
   // Use Cloudinary, AWS S3, or your preferred storage
   ```

5. **Add Rate Limiting**

   - Implement rate limiting for public endpoints
   - Use libraries like `@upstash/ratelimit` or similar

6. **Add Caching**
   - Cache public content responses
   - Invalidate cache on content updates

## Testing

Test the endpoints using:

- Postman
- curl
- Frontend integration

Example test:

```bash
# Get user cart
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add item to cart
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"item": {"id": "product-1", "productId": "product-1", ...}}'
```

## Notes

- All routes follow Next.js 13+ App Router conventions
- Error responses follow the standard format from documentation
- Database operations are abstracted for easy replacement
- Authentication is required for most endpoints (except public content)




