import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey) {
      throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
    }
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
};

