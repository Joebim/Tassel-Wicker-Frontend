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

CURRENCY_API_KEY=your_currency_api_key

# Google SMTP Configuration (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Tassel & Wicker
CONTACT_FORM_RECIPIENT=recipient@example.com
ADMIN_EMAIL=admin@example.com

# Stripe Webhook
STRIPE_WEBHOOK_SECRET=your_webhook_secret

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
- Email notifications via Google SMTP (order confirmations, payment confirmations, contact form submissions)

## Email Setup (Google SMTP)

The application uses Google SMTP to send transactional emails. To set up:

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:

   - Go to your Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Configure Environment Variables**:

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   SMTP_FROM=your-email@gmail.com
   SMTP_FROM_NAME=Tassel & Wicker
   CONTACT_FORM_RECIPIENT=recipient@example.com  # Where contact form submissions are sent
   ADMIN_EMAIL=admin@example.com  # Where order notifications are sent
   ```

4. **Stripe Webhook Setup**:
   - Set up a webhook endpoint in your Stripe dashboard
   - Point it to: `https://yourdomain.com/api/webhooks/stripe`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**Note**: The app sends emails for:

- Contact form submissions
- Order confirmations (after successful payment)
- Payment confirmations
- Admin notifications for new orders
