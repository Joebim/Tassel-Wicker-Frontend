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
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

NEXT_PUBLIC_CURRENCY_API_KEY=your_currency_api_key
RESEND_API_KEY=your_resend_api_key
SYSTEME_API_KEY=your_systeme_api_key
```

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

## Features

- Product catalog and shopping
- User authentication (Firebase)
- Shopping cart
- Checkout with Stripe integration
- Blog system
- Contact forms
- Custom basket builder
