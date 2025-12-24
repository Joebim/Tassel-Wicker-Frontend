## Tassel & Wicker – Backend API Guide (for Frontend)

This document describes all backend endpoints and how the Next frontend should call them.

### Base URL / Environments

- **Local backend**: `http://localhost:4000`
- **API base**: `http://localhost:4000/api`

Recommended frontend env (Next):

- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

Then call endpoints as:

- `fetch(\`\${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products\`)`

### Auth model (JWT)

- **Access token**: short-lived JWT. Send in header:
  - `Authorization: Bearer <token>`
- **Refresh token**: long-lived opaque string returned by login/register/refresh.
  - Store securely (client-side storage or httpOnly cookie if you later move to cookie-based auth).

### Common response + error shape

- **Success**: JSON object, varies by endpoint.
- **Error**: JSON:
  - `error`: string code (example: `BadRequest`, `Unauthorized`, `NotFound`, `InternalError`)
  - `message`: human readable
  - `requestId`: useful for debugging logs
  - `details` (optional): validation details

### CORS

Backend allows cross-origin requests if the origin is listed in `.env`:

- `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`

---

## Authentication Endpoints (`/api/auth`)

### Register

`POST /api/auth/register`

Body:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "acceptTerms": true,
  "newsletter": true
}
```

Response (201):

```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "customer",
    "isEmailVerified": false,
    "addresses": [],
    "preferences": {
      "newsletter": true,
      "marketing": false,
      "currency": "USD",
      "language": "en"
    },
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "<accessToken>",
  "refreshToken": "<refreshToken>"
}
```

### Login

`POST /api/auth/login`

Body:

```json
{ "email": "user@example.com", "password": "password123", "rememberMe": true }
```

Response:

```json
{
  "user": { "...": "..." },
  "token": "<accessToken>",
  "refreshToken": "<refreshToken>"
}
```

### Refresh

`POST /api/auth/refresh`

Body:

```json
{ "refreshToken": "<refreshToken>" }
```

Response:

```json
{ "token": "<newAccessToken>", "refreshToken": "<newRefreshToken>" }
```

### Logout

`POST /api/auth/logout`

Body:

```json
{ "refreshToken": "<refreshToken>" }
```

Response:

```json
{ "success": true }
```

### Current user

`GET /api/auth/me`

Headers:

- `Authorization: Bearer <token>`

Response:

```json
{ "user": { "...": "..." } }
```

### Forgot password

`POST /api/auth/forgot-password`

Body:

```json
{ "email": "user@example.com" }
```

Response:

```json
{ "success": true }
```

### Reset password

`POST /api/auth/reset-password`

Body:

```json
{ "token": "<resetToken>", "newPassword": "newStrongPassword123" }
```

Response:

```json
{ "success": true }
```

---

## Catalog Endpoints

### Categories

#### List categories

`GET /api/categories`

Response:

```json
{
  "items": [
    {
      "id": "...",
      "name": "...",
      "slug": "...",
      "description": "...",
      "image": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### Get category

`GET /api/categories/:id`

#### Create category (admin/moderator)

`POST /api/categories`

Headers:

- `Authorization: Bearer <token>`

Body:

```json
{
  "name": "Gift Baskets",
  "slug": "gift-baskets",
  "description": "...",
  "image": "https://..."
}
```

#### Update category (admin/moderator)

`PUT /api/categories/:id`

Body: any subset of the create payload.

#### Delete category (admin only)

`DELETE /api/categories/:id`

---

### Products

#### List products (public)

`GET /api/products`

Query params:

- `page` (default 1)
- `limit` (default 20, max 100)
- `search` (text search across name/description/tags)
- `categoryId` (Mongo ObjectId)
- `type` (`basket|custom|single`) **product type**
- `role` (`main|sub`) **main vs sub product**
- `featured` (`true|false`)
- `inStock` (`true|false`)

Response:

```json
{
  "items": [
    {
      "id": "...",
      "name": "...",
      "price": 10,
      "images": [],
      "tags": [],
      "featured": false,
      "inStock": true,
      "stockQuantity": 0,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 123,
  "totalPages": 7
}
```

#### Get product

`GET /api/products/:id`

Optional query:

- `include=linked` — returns `linkedProducts` array in response (for baskets and “single main with sub-items”).

#### All single products (for Custom page)

`GET /api/products/singles`

Returns all products where `productType=single` (includes both `role=main` and `role=sub`).

#### Create product (admin/moderator)

`POST /api/products`

Headers:

- `Authorization: Bearer <token>`

Body:

```json
{
  "externalId": "optional-static-id",
  "name": "Luxury Basket",
  "description": "....",
  "price": 120,
  "originalPrice": 150,
  "images": ["https://..."],
  "coverImage": "https://...",
  "categoryId": "<categoryObjectId>",
  "category": "Baskets",
  "productType": "basket",
  "productRole": "main",
  "parentProductId": null,
  "linkedProductIds": ["<mongoId>", "<mongoId>"],
  "tags": ["luxury"],
  "inStock": true,
  "stockQuantity": 10,
  "featured": true,
  "isNew": false,
  "isCustom": false,
  "variants": [{ "name": "Default", "image": "https://...", "price": 120 }],
  "details": { "any": "json" }
}
```

#### Update product (admin/moderator)

`PUT /api/products/:id`

Body: any subset of create payload.

#### Delete product (admin only)

`DELETE /api/products/:id`

#### Upload product image (Cloudinary) and append to product

`POST /api/products/:id/images`

Headers:

- `Authorization: Bearer <token>`

Body (multipart/form-data):

- `file`: image file

Response:

```json
{
  "item": { "...": "..." },
  "upload": { "url": "https://...", "publicId": "..." }
}
```

#### Upload product image (Cloudinary) generic

`POST /api/uploads/product-image`

Headers:

- `Authorization: Bearer <token>`

Body (multipart/form-data):

- `file`: image file
  Notes:
- Upload folder is controlled by backend env: `CLOUDINARY_FOLDER` (no per-request override).

---

## Orders

### Create order

`POST /api/orders`

Auth:

- Optional. If user is logged in, pass `Authorization: Bearer <token>` to associate order to the user.

Body:

```json
{
  "items": [
    {
      "productId": "<mongoId or external id>",
      "productName": "Luxury Basket",
      "productImage": "https://...",
      "price": 120,
      "quantity": 1,
      "total": 120
    }
  ],
  "shipping": {
    "firstName": "Jane",
    "lastName": "Doe",
    "address1": "Street 1",
    "address2": "",
    "city": "London",
    "state": "London",
    "postalCode": "E1 1AA",
    "country": "GB",
    "phone": "+44...",
    "method": "standard",
    "cost": 10
  },
  "billing": {
    "firstName": "Jane",
    "lastName": "Doe",
    "address1": "Street 1",
    "address2": "",
    "city": "London",
    "state": "London",
    "postalCode": "E1 1AA",
    "country": "GB",
    "phone": "+44..."
  },
  "payment": {
    "method": "card",
    "status": "pending",
    "stripePaymentIntentId": "pi_...",
    "stripeCheckoutSessionId": "cs_..."
  },
  "totals": {
    "subtotal": 120,
    "shipping": 10,
    "tax": 0,
    "discount": 0,
    "total": 130
  },
  "notes": "..."
}
```

Notes:

- Backend validates subtotal/total math.
- Backend attempts stock checks/decrement only if `productId` is a valid Mongo ObjectId and product exists.

### My orders

`GET /api/orders/my` (auth required)

### Get order

`GET /api/orders/:id` (auth required; owner or admin/moderator)

### Admin: list orders

`GET /api/orders/admin/list?page=1&limit=20` (admin/moderator)

### Admin: update order

`PATCH /api/orders/admin/:id` (admin/moderator)

Body:

```json
{ "status": "shipped", "trackingNumber": "DHL123..." }
```

---

## Stripe + Email + Newsletter “Compat” Endpoints (matches existing Next usage)

These exist so you can migrate the Next app without changing its fetch calls immediately.

### Create payment intent

`POST /api/create-payment-intent`

Body:

```json
{
  "amount": 130,
  "currency": "gbp",
  "items": [],
  "metadata": { "customerEmail": "..." },
  "fxQuoteId": "fxq_..."
}
```

Response:

```json
{ "clientSecret": "pi_..._secret_...", "paymentIntentId": "pi_..." }
```

### Update payment intent

`POST /api/update-payment-intent`

Body:

```json
{ "paymentIntentId": "pi_...", "amount": 150, "currency": "gbp" }
```

### Create checkout session

`POST /api/create-checkout-session`

Body:

```json
{
  "amount": 130,
  "items": [{ "name": "Item", "price": 120, "quantity": 1 }],
  "metadata": {},
  "customerEmail": "user@example.com"
}
```

Response:

```json
{ "sessionId": "cs_...", "url": "https://checkout.stripe.com/..." }
```

### Shipping rate lookup

`POST /api/get-shipping-rate`

Body:

```json
{ "rateId": "shr_..." }
```

### FX quotes (Stripe preview API)

- `POST /api/fx-quote`
- `GET /api/fx-quote?id=fxq_...`

### Send order email (used by payment success page)

`POST /api/send-order-email`

Body:

```json
{
  "paymentIntentId": "pi_...",
  "customerEmail": "user@example.com",
  "customerName": "Jane"
}
```

Response:

```json
{
  "success": true,
  "message": "...",
  "orderId": "pi_...",
  "orderEmailMessageId": "...",
  "paymentEmailMessageId": "..."
}
```

Also:

- Upserts a minimal `Order` record keyed by `payment.stripePaymentIntentId`.

### Stripe webhook

`POST /api/webhooks/stripe`

Important:

- Must be called by Stripe with **raw JSON body** (already handled in backend).
- Requires `STRIPE_WEBHOOK_SECRET`.

On `payment_intent.succeeded`:

- Sends customer emails (if email available)
- Emails admin (if configured)
- Upserts minimal `Order` record

### Contact form

`POST /api/contact`

Body:

```json
{ "name": "Jane", "email": "jane@example.com", "message": "Hi..." }
```

### Newsletter (Systeme.io)

`POST /api/newsletter`

Body:

```json
{
  "email": "user@example.com",
  "locale": "en",
  "fields": [{ "slug": "first_name", "value": "Jane" }]
}
```

### Test email endpoint

- `GET /api/test-email`
- `POST /api/test-email` (echo)

---

## Migration options for the Next frontend

### Option A (recommended): call backend directly

- Add `NEXT_PUBLIC_API_BASE_URL`
- Replace `fetch("/api/...")` with `fetch(\`\${NEXT_PUBLIC_API_BASE_URL}/api/...\`)`

### Option B: keep `fetch("/api/...")` by proxying in Next

Use Next rewrites so `/api/:path*` forwards to the backend:

- In `tassel-wicker-next/next.config.ts`:
  - rewrite `/api/:path*` -> `http://localhost:4000/api/:path*`

This keeps the frontend code unchanged while you transition.

---

## Seeding products from existing static data

The backend can import products from:

- `tassel-wicker-next/utils/productData.ts`

Run:

```bash
npm run seed:products
```

What this does:

- Creates **sub products** from `getAllSubProducts()` as `productType=single` + `productRole=sub`
- Creates **standalone products** from `getAdditionalProducts()` as `productType=single` + `productRole=main`
  - If a standalone product has its own child items (like the ramekins example), it creates those as `role=sub` and links them via `linkedProductIds`.
- Creates **main products** from `shopProducts`:
  - Baskets as `productType=basket`
  - Build Your Basket as `productType=custom`
  - Links basket contents via `linkedProductIds`.
