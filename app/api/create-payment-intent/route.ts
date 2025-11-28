import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = "gbp", items, metadata } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Always use GBP - Stripe handles currency conversion automatically during checkout
    const targetCurrency = "gbp";
    // Don't include shipping cost - Stripe will add it automatically based on selected shipping rate
    const finalAmount = amount;

    // Convert amount to smallest currency unit (pence for GBP)
    const divisor = 100;
    const amountInSmallestUnit = Math.round(finalAmount * divisor);

    // Create payment intent with multiple payment methods enabled
    // Using automatic_payment_methods enables all available payment methods automatically
    // This includes: cards, Link, Apple Pay, Google Pay, and region-specific methods
    // Note: Shipping options are configured in PaymentElement on the frontend, not here
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: targetCurrency,
      automatic_payment_methods: {
        enabled: true,
        // Allow redirect-based payment methods (e.g., iDEAL, Bancontact, Sofort)
        allow_redirects: "always",
      },
      metadata: {
        ...metadata,
        items: JSON.stringify(items || []),
        originalAmount: amount.toString(),
        currency: targetCurrency,
      },
    });

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
