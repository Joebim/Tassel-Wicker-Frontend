import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/**
 * Fetches real-time exchange rates from ExchangeRate-API
 * @param baseCurrency - Base currency code (default: USD)
 * @returns Object with conversion rates or null on error
 */
async function fetchExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number> | null> {
  try {
    const apiKey = process.env.CURRENCY_API_KEY;

    if (!apiKey) {
      console.warn('CURRENCY_API_KEY not found in environment variables');
      return null;
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.result === 'success' && result.conversion_rates) {
      return result.conversion_rates;
    } else {
      throw new Error(result.error || 'Failed to fetch currency data');
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}

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
    
    // If currency is not USD, fetch real-time exchange rates and convert the amount
    if (targetCurrency !== 'usd') {
      const exchangeRates = await fetchExchangeRates('USD');
      
      if (exchangeRates) {
        // ExchangeRate-API returns rates with uppercase currency codes
        const currencyCodeUpper = targetCurrency.toUpperCase();
        const exchangeRate = exchangeRates[currencyCodeUpper];
        
        if (exchangeRate && exchangeRate > 0) {
          finalAmount = amount * exchangeRate;
        } else {
          console.warn(`Exchange rate not found for ${currencyCodeUpper}, using 1.0`);
          // Fallback to 1.0 if rate not found
        }
      } else {
        console.warn('Failed to fetch exchange rates, using original amount');
        // Fallback to original amount if API call fails
      }
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
