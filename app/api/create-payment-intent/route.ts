import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "gbp", items, metadata, fxQuoteId } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Convert amount to smallest currency unit
    const divisor = currency.toLowerCase() === "jpy" ? 1 : 100;
    const amountInSmallestUnit = Math.round(amount * divisor);

    // If fx_quote is provided, use raw HTTP API to include the preview version header
    if (fxQuoteId) {
      const formData = new URLSearchParams();
      formData.append('amount', amountInSmallestUnit.toString());
      formData.append('currency', currency.toLowerCase());
      formData.append('fx_quote', fxQuoteId);
      formData.append('automatic_payment_methods[enabled]', 'true');
      formData.append('automatic_payment_methods[allow_redirects]', 'always');
      
      // Add metadata
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          formData.append(`metadata[${key}]`, String(value));
        });
        if (items) {
          formData.append('metadata[items]', JSON.stringify(items));
        }
        formData.append('metadata[originalAmount]', amount.toString());
        formData.append('metadata[currency]', currency.toLowerCase());
      }

      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Version': '2025-10-29.clover;fx_quote_preview=v1',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}: ${response.statusText}` } }));
        console.error('Stripe API error:', errorData);
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const paymentIntent = await response.json();
      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    // For regular PaymentIntents without fx_quote, use SDK
    const paymentIntentParams: any = {
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
        // Allow redirect-based payment methods (e.g., iDEAL, Bancontact, Sofort)
        allow_redirects: "always",
      },
      metadata: {
        ...metadata,
        items: JSON.stringify(items || []),
        originalAmount: amount.toString(),
        currency: currency.toLowerCase(),
      },
    };

    // Create payment intent with multiple payment methods enabled
    // Using automatic_payment_methods enables all available payment methods automatically
    // This includes: cards, Link, Apple Pay, Google Pay, and region-specific methods
    // Note: Shipping options are configured in PaymentElement on the frontend, not here
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment intent",
      },
      { status: 500 }
    );
  }
}
