import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rateId } = body;

    if (!rateId) {
      return NextResponse.json({ error: "Shipping rate ID is required" }, { status: 400 });
    }

    // Retrieve shipping rate from Stripe
    const shippingRate = await stripe.shippingRates.retrieve(rateId);

    return NextResponse.json({
      id: shippingRate.id,
      amount: shippingRate.fixed_amount?.amount || 0,
      currency: shippingRate.fixed_amount?.currency || 'gbp',
      displayName: shippingRate.display_name,
    });
  } catch (error) {
    console.error("Error fetching shipping rate:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch shipping rate",
      },
      { status: 500 }
    );
  }
}

