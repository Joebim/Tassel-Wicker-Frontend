import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, items, metadata, customerEmail } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Convert amount to smallest currency unit (pence for GBP)
    const amountInSmallestUnit = Math.round(amount * 100);

    // Stripe shipping rate IDs
    const shippingRates = [
      'shr_1SY6XKDqrk2AVTntaI2Qcu4V', // International delivery within Europe (DHL)
      'shr_1SY6VyDqrk2AVTnto4PrPyL3', // International delivery outside Europe (DHL)
      'shr_1SY658Dqrk2AVTnt4LEtyBhH', // Standard shipping incl VAT (DHL)
    ];

    // Create line items from cart items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert to pence
      },
      quantity: item.quantity,
    }));

    // Create Checkout Session with shipping options
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: [
          'US', 'CA', 'GB', 'AU', 'NZ',
          'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'IE', 'PT', 'GR', 'FI', 'SE', 'DK', 'NO', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'LU', 'MT', 'CY',
          'JP', 'KR', 'CN', 'SG', 'MY', 'TH', 'ID', 'PH', 'VN', 'IN',
          'ZA', 'NG', 'KE', 'EG',
          'BR', 'MX', 'AR', 'CL', 'CO', 'PE',
        ],
      },
      shipping_options: shippingRates.map(rateId => ({
        shipping_rate: rateId,
      })),
      success_url: `${request.headers.get('origin') || 'https://tasselandwicker.com'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || 'https://tasselandwicker.com'}/checkout`,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        items: JSON.stringify(items || []),
        originalAmount: amount.toString(),
        currency: 'gbp',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}

