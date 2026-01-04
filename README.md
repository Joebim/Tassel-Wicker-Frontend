# Tassel & Wicker - Next.js

This is the Next.js version of the Tassel & Wicker e-commerce website, migrated from Vite React.

## Project Structure

```
tassel-wicker-next/
├── app/
│   ├── (site)/              # Public pages
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── providers.tsx        # Context providers
├── components/              # React components
├── context/                 # React contexts
├── services/                # API services
├── store/                   # Zustand stores
├── utils/                   # Utility functions
├── types/                   # TypeScript types
└── public/                  # Static assets
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with the following variables:

```env
# Stripe (Public Key - Safe for Frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# API Base URL (Optional - defaults to same-origin if not set)
# In development, defaults to http://localhost:4000
# NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

**Note:** Most functionality has been moved to the backend. All server-side configuration (MongoDB, JWT secrets, Cloudinary, Stripe secrets, Resend API, SMTP, etc.) is now handled by the backend. See `ENV_CLEANUP.md` for details on removed variables.

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Migration Notes

- All React Router components have been converted to Next.js App Router
- `Link` components now use `next/link` with `href` instead of `to`
- `useNavigate` and `useLocation` replaced with Next.js `useRouter` and `usePathname`
- Environment variables use `NEXT_PUBLIC_` prefix for client-side access
- All pages are now in the `app/(site)` directory using Next.js routing
- API routes are in `app/api` directory
- Most functionality has been moved to a separate backend API
- Authentication, database, and server-side operations are handled by the backend

## Features

- Product catalog and shopping
- User authentication (Backend API)
- Shopping cart
- Checkout with Stripe integration
- Blog system
- Contact forms
- Custom basket builder
- Email notifications (handled by backend via Resend)

## Backend Integration

This frontend application communicates with a separate backend API. All server-side operations (authentication, database, email, file uploads, etc.) are handled by the backend.

**Backend Configuration:** See the backend repository for environment variable setup (MongoDB, JWT secrets, Cloudinary, Stripe secrets, Resend API, etc.)

**Frontend Configuration:** Only requires the Stripe publishable key for payment processing.
