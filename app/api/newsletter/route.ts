import { NextRequest, NextResponse } from "next/server";

interface SystemeContactRequest {
  email: string;
  locale?: string;
  fields?: Array<{
    slug: string;
    value: string;
  }>;
}

interface SystemeContactResponse {
  id: number;
  email: string;
  registeredAt: string;
  locale: string;
  sourceURL: string;
  unsubscribed: boolean;
  bounced: boolean;
  needsConfirmation: boolean;
  fields: Array<{
    fieldName: string;
    slug: string;
    value: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, locale = "en", fields = [] } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if Systeme API key is configured
    const apiKey = process.env.SYSTEME_API_KEY;
    if (!apiKey) {
      console.error(
        "SYSTEME_API_KEY is not configured in environment variables"
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Newsletter service is not configured. Please set SYSTEME_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Prepare request data for Systeme.io
    // Use only the fields provided by the client, or empty array
    // Note: Custom fields must exist in your Systeme.io account
    const contactData: SystemeContactRequest = {
      email: email.trim().toLowerCase(),
      locale: locale || "en",
      // Only include fields if they are provided and not empty
      ...(fields && fields.length > 0 && { fields }),
    };

    // Call Systeme.io API
    try {
      // Systeme.io API endpoint
      // Note: According to Systeme.io documentation, the endpoint is /api/contacts
      const apiUrl = "https://api.systeme.io/api/contacts";

      // Log request details (without exposing full API key)
      console.log("Calling Systeme.io API:", {
        url: apiUrl,
        method: "POST",
        hasApiKey: !!apiKey,
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : "none",
        apiKeyLength: apiKey?.length,
        contactData: {
          email: contactData.email,
          locale: contactData.locale,
          fieldsCount: contactData.fields?.length || 0,
        },
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
        body: JSON.stringify(contactData),
      });

      console.log("Systeme.io API response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        // Read error response as text first (can't read twice)
        const errorText = await response.text().catch(() => "");
        let errorData: { message?: string; [key: string]: unknown } = {};

        try {
          errorData = errorText ? JSON.parse(errorText) : {};
        } catch {
          errorData = { message: errorText || "Unknown error" };
        }

        console.error("Systeme.io API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          errorText: errorText.substring(0, 500), // Limit log size
        });

        // Handle specific error cases
        if (response.status === 409) {
          return NextResponse.json(
            {
              success: false,
              error: "This email is already subscribed to our newsletter.",
            },
            { status: 409 }
          );
        }

        if (response.status === 401 || response.status === 403) {
          return NextResponse.json(
            {
              success: false,
              error:
                response.status === 403
                  ? "API key authentication failed. Please check: 1) Your SYSTEME_API_KEY is correct, 2) The API key has permission to create contacts, 3) The API key is not expired, 4) Your IP address is whitelisted (if required)."
                  : "Newsletter service authentication failed. Please verify your API key is valid.",
              details:
                errorData.message ||
                errorText ||
                "Check Systeme.io API settings and documentation.",
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error:
              errorData.message ||
              `Failed to subscribe. Please try again. (${response.status})`,
            details: errorData,
          },
          { status: response.status }
        );
      }

      const data: SystemeContactResponse = await response.json();

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to newsletter!",
        data: {
          id: data.id,
          email: data.email,
          registeredAt: data.registeredAt,
          needsConfirmation: data.needsConfirmation,
        },
      });
    } catch (fetchError) {
      console.error("Systeme.io API fetch error:", fetchError);
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to connect to newsletter service";
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details:
            fetchError instanceof Error ? fetchError.stack : String(fetchError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to process newsletter subscription";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
