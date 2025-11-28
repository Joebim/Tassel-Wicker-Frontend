import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, amount, currency = "gbp" } = body;

    if (!paymentIntentId || !amount) {
      return NextResponse.json(
        { error: "Payment intent ID and amount are required" },
        { status: 400 }
      );
    }

    // Convert amount to smallest currency unit
    // Most currencies use 100 (e.g., cents), but some like JPY use 1
    const divisor = currency.toLowerCase() === "jpy" ? 1 : 100;
    const amountInSmallestUnit = Math.round(amount * divisor);

    // Update payment intent with new amount
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      amount: amountInSmallestUnit,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.error("Error updating payment intent:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update payment intent",
      },
      { status: 500 }
    );
  }
}

