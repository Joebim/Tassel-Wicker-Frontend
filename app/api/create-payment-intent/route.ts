import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// Exchange rates (base: USD = 1.0)
// These should be updated periodically or fetched from an API
const EXCHANGE_RATES: Record<string, number> = {
  usd: 1.0,
  gbp: 0.79,
  eur: 0.92,
  cad: 1.36,
  aud: 1.52,
  jpy: 149.50,
  ngn: 1500.0,
  zar: 18.75,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd', items, metadata } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Amount is in USD (base currency from cart)
    // Convert to target currency if needed
    const targetCurrency = currency.toLowerCase();
    let finalAmount = amount;
    
    // If currency is not USD, convert the amount
    if (targetCurrency !== 'usd') {
      const exchangeRate = EXCHANGE_RATES[targetCurrency] || 1.0;
      finalAmount = amount * exchangeRate;
    }

    // Convert amount to smallest currency unit (cents for most currencies)
    // For JPY, it's already in the smallest unit
    const divisor = targetCurrency === 'jpy' ? 1 : 100;
    const amountInSmallestUnit = Math.round(finalAmount * divisor);

    // Create payment intent with multiple payment methods enabled
    // Using automatic_payment_methods enables all available payment methods automatically
    // This includes: cards, Link, Apple Pay, Google Pay, and region-specific methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: targetCurrency,
      automatic_payment_methods: {
        enabled: true,
        // Allow redirect-based payment methods (e.g., iDEAL, Bancontact, Sofort)
        allow_redirects: 'always',
      },
      metadata: {
        ...metadata,
        items: JSON.stringify(items || []),
        originalAmountUSD: amount.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create payment intent' 
      },
      { status: 500 }
    );
  }
}
