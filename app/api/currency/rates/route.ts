import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-side API route for fetching currency exchange rates
 * This keeps the API key secure on the server
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.CURRENCY_API_KEY;

    if (!apiKey) {
      console.warn("CURRENCY_API_KEY not found in environment variables");
      return NextResponse.json(
        {
          success: false,
          error: "Currency API key not configured",
          rates: null,
        },
        { status: 500 }
      );
    }

    // Get base currency from query params (default to USD)
    const searchParams = request.nextUrl.searchParams;
    const baseCurrency = searchParams.get("base") || "USD";

    // Fetch exchange rates from ExchangeRate-API
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.result === "success" && result.conversion_rates) {
      return NextResponse.json({
        success: true,
        base: result.base_code || baseCurrency,
        rates: result.conversion_rates,
        lastUpdate: result.time_last_update_unix || Date.now(),
      });
    } else {
      throw new Error(result.error || "Failed to fetch currency data");
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        rates: null,
      },
      { status: 500 }
    );
  }
}
