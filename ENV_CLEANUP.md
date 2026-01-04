# Environment Variables Cleanup Guide

Based on the backend migration, here are the environment variables that should be **REMOVED** from the frontend `.env` file:

## Variables to Remove (Backend Only)

### Authentication & Security (Moved to Backend)
- ❌ All `NEXT_PUBLIC_FIREBASE_*` variables (not used in codebase)
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Email Services (Moved to Backend)
- ❌ All `NEXT_PUBLIC_EMAILJS_*` variables (not used, contact form uses backend API)
  - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
  - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
  - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

- ❌ SMTP Configuration (server-side only, handled by backend Resend)
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASSWORD`
  - `SMTP_FROM`
  - `SMTP_FROM_NAME`
  - `CONTACT_FORM_RECIPIENT`
  - `ADMIN_EMAIL`

### Stripe (Server-Side Secrets)
- ❌ `STRIPE_SECRET_KEY` (backend only, never expose in frontend)
- ❌ `STRIPE_WEBHOOK_SECRET` (backend only)

### Currency API (Not Used)
- ❌ `CURRENCY_API_KEY` (currency conversion now handled by Stripe FX quotes)

## Variables to KEEP (Frontend Still Needs)

### Stripe (Public Key Only)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Used in:
  - `services/stripeClient.ts`
  - `app/(site)/checkout/page.tsx`

### API Configuration (Optional)
- ✅ `NEXT_PUBLIC_API_BASE_URL` - Optional, used in:
  - `services/apiClient.ts`
  - `app/(site)/admin/layout.tsx` (for display)
  - Defaults to `http://localhost:4000` in development
  - Defaults to same-origin in production if not set

## Summary

**Remove:** 18+ variables (Firebase, EmailJS, SMTP, Stripe secrets, Currency API)

**Keep:** 2 variables (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and optionally `NEXT_PUBLIC_API_BASE_URL`)

## Minimal Frontend `.env.local` Example

```env
# Stripe (Public Key - Safe for Frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# API Base URL (Optional - defaults to same-origin if not set)
# NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

All other configuration (MongoDB, JWT secrets, Cloudinary, Stripe secrets, Resend API, etc.) is now handled by the backend.





