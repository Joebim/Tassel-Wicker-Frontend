import { NextRequest, NextResponse } from "next/server";

/**
 * Currencies that only support "none" lock duration (current live rate only)
 * Based on Stripe's FX Quotes API limitations
 */
const CURRENCIES_ONLY_NONE = new Set(['ngn', 'zar']);

/**
 * Determines the appropriate lock duration based on currencies
 * Some currencies only support "none", so we use the most restrictive option
 */
function getLockDuration(fromCurrencies: string[], requestedDuration: string = "hour"): string {
  // If any currency only supports "none", use "none"
  const hasRestrictedCurrency = fromCurrencies.some((c) =>
    CURRENCIES_ONLY_NONE.has(c.toLowerCase())
  );
  
  if (hasRestrictedCurrency) {
    return "none";
  }
  
  // Otherwise use the requested duration (defaults to "hour" for most currencies)
  return requestedDuration;
}

/**
 * API route to create or retrieve a Stripe FX Quote
 * Uses Stripe's FX Quotes API (preview feature)
 * 
 * @param to_currency - Settlement currency (always GBP for this merchant)
 * @param from_currencies - Array of currencies to convert from
 * @param lock_duration - Duration to lock the rate (none, five_minutes, hour, day)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toCurrency = "gbp", fromCurrencies = ["usd", "eur", "cad", "aud", "jpy"], lockDuration = "hour" } = body;

    // Validate inputs
    if (!Array.isArray(fromCurrencies) || fromCurrencies.length === 0) {
      return NextResponse.json(
        { error: "fromCurrencies must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not set" },
        { status: 500 }
      );
    }

    // Determine the appropriate lock duration based on currencies
    const effectiveLockDuration = getLockDuration(fromCurrencies, lockDuration);
    
    // Use raw HTTP API call to match Stripe's exact format from documentation
    // Stripe FX Quotes API requires preview version and may not be in SDK yet
    // Format matches: curl -u "sk_test_..." -d to_currency=gbp -d "from_currencies[]"=eur -d lock_duration=day
    const formData = new URLSearchParams();
    formData.append('to_currency', toCurrency.toLowerCase());
    fromCurrencies.forEach((c: string) => {
      formData.append('from_currencies[]', c.toLowerCase());
    });
    formData.append('lock_duration', effectiveLockDuration);
    
    const response = await fetch('https://api.stripe.com/v1/fx_quotes', {
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
      console.error('Stripe API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const fxQuote = await response.json();

    return NextResponse.json({
      success: true,
      fxQuote: {
        id: fxQuote.id,
        toCurrency: fxQuote.to_currency,
        lockDuration: fxQuote.lock_duration,
        lockExpiresAt: fxQuote.lock_expires_at,
        lockStatus: fxQuote.lock_status,
        rates: fxQuote.rates,
      },
    });
  } catch (error: any) {
    console.error("Error creating FX quote:", error);
    console.error("Error details:", {
      type: error?.type,
      code: error?.code,
      message: error?.message,
      statusCode: error?.statusCode,
      raw: error,
    });
    
    // Handle specific Stripe errors
    if (error?.type === "StripeInvalidRequestError" || error?.statusCode) {
      return NextResponse.json(
        {
          error: error.message || "Invalid request to Stripe FX Quotes API",
          code: error.code,
          type: error.type,
        },
        { status: error.statusCode || 400 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create FX quote",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve an existing FX quote
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("id");

    if (!quoteId) {
      return NextResponse.json(
        { error: "FX quote ID is required" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY is not set" },
        { status: 500 }
      );
    }

    // Use raw HTTP API call to retrieve FX quote
    const response = await fetch(`https://api.stripe.com/v1/fx_quotes/${quoteId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': '2025-10-29.clover;fx_quote_preview=v1',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}: ${response.statusText}` } }));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const fxQuote = await response.json();

    return NextResponse.json({
      success: true,
      fxQuote: {
        id: fxQuote.id,
        toCurrency: fxQuote.to_currency,
        lockDuration: fxQuote.lock_duration,
        lockExpiresAt: fxQuote.lock_expires_at,
        lockStatus: fxQuote.lock_status,
        rates: fxQuote.rates,
      },
    });
  } catch (error: any) {
    console.error("Error retrieving FX quote:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve FX quote",
      },
      { status: 500 }
    );
  }
}

