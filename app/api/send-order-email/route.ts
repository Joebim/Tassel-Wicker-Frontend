import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import {
  createOrderConfirmationEmailTemplate,
  createPaymentConfirmationEmailTemplate,
} from "@/lib/email-templates";
import { stripe } from "@/lib/stripe";

// Log when module is loaded
console.log(
  "[SEND-ORDER-EMAIL] Route module loaded at:",
  new Date().toISOString()
);

export async function POST(request: NextRequest) {
  console.log("[SEND-ORDER-EMAIL] ========== POST REQUEST RECEIVED ==========");
  console.log(
    "[SEND-ORDER-EMAIL] Request received at:",
    new Date().toISOString()
  );
  console.log("[SEND-ORDER-EMAIL] Request URL:", request.url);
  console.log("[SEND-ORDER-EMAIL] Request method:", request.method);
  console.log(
    "[SEND-ORDER-EMAIL] Request headers:",
    Object.fromEntries(request.headers.entries())
  );

  try {
    const bodyText = await request.text();
    console.log("[SEND-ORDER-EMAIL] Raw request body:", bodyText);
    const body = JSON.parse(bodyText);
    console.log("[SEND-ORDER-EMAIL] Request body:", {
      paymentIntentId: body.paymentIntentId,
      customerEmail: body.customerEmail
        ? `${body.customerEmail.substring(0, 3)}***`
        : "missing",
      customerName: body.customerName || "missing",
    });

    const { paymentIntentId, customerEmail, customerName } = body;

    // Validate required fields
    if (!paymentIntentId) {
      console.error(
        "[SEND-ORDER-EMAIL] Validation failed: Payment intent ID is required"
      );
      return NextResponse.json(
        { success: false, error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      console.error(
        "[SEND-ORDER-EMAIL] Validation failed: Customer email is required"
      );
      return NextResponse.json(
        { success: false, error: "Customer email is required" },
        { status: 400 }
      );
    }

    console.log(
      "[SEND-ORDER-EMAIL] Validation passed, fetching payment intent from Stripe..."
    );

    // Fetch payment intent from Stripe to get order details
    let paymentIntent;
    try {
      console.log(
        "[SEND-ORDER-EMAIL] Retrieving payment intent:",
        paymentIntentId
      );
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log("[SEND-ORDER-EMAIL] Payment intent retrieved successfully:", {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      });
    } catch (error) {
      console.error(
        "[SEND-ORDER-EMAIL] Error retrieving payment intent:",
        error
      );
      return NextResponse.json(
        { success: false, error: "Failed to retrieve payment intent" },
        { status: 500 }
      );
    }

    // Extract metadata
    const metadata = paymentIntent.metadata || {};
    const items = metadata.items ? JSON.parse(metadata.items) : [];
    const orderId = paymentIntent.id;
    const currency =
      metadata.currency || paymentIntent.currency?.toUpperCase() || "GBP";

    // Calculate total amount (convert from smallest unit back to normal)
    const divisor = currency === "JPY" ? 1 : 100;
    const totalAmount = paymentIntent.amount / divisor;

    // Extract shipping address from payment intent if available
    const shippingAddress = paymentIntent.shipping
      ? {
          name: paymentIntent.shipping.name || customerName || "Customer",
          address: paymentIntent.shipping.address?.line1 || "",
          city: paymentIntent.shipping.address?.city || "",
          postalCode: paymentIntent.shipping.address?.postal_code || "",
          country: paymentIntent.shipping.address?.country || "",
        }
      : undefined;

    // Parse order items
    const orderItems = items.map((item: any) => ({
      id: item.id || "unknown",
      name: item.name || "Unknown Item",
      quantity: item.quantity || 1,
      price: item.price || 0,
    }));

    const orderDetails = {
      orderId: orderId,
      customerName: customerName || metadata.customerName || "Valued Customer",
      customerEmail: customerEmail,
      items: orderItems,
      totalAmount: totalAmount,
      currency: currency,
      shippingAddress: shippingAddress,
      paymentMethod: paymentIntent.payment_method_types?.[0] || "card",
      orderDate: new Date().toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    // Send order confirmation email
    console.log(
      "[SEND-ORDER-EMAIL] Sending order confirmation email to:",
      customerEmail
    );
    const orderEmailResult = await sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderId.substring(3, 13)}`,
      html: createOrderConfirmationEmailTemplate(orderDetails),
    });

    if (!orderEmailResult.success) {
      console.error(
        "[SEND-ORDER-EMAIL] Failed to send order confirmation email:",
        orderEmailResult.error
      );
      return NextResponse.json(
        {
          success: false,
          error:
            orderEmailResult.error || "Failed to send order confirmation email",
        },
        { status: 500 }
      );
    }

    console.log(
      "[SEND-ORDER-EMAIL] Order confirmation email sent successfully:",
      orderEmailResult.messageId
    );

    // Send payment confirmation email
    console.log(
      "[SEND-ORDER-EMAIL] Sending payment confirmation email to:",
      customerEmail
    );
    const paymentEmailResult = await sendEmail({
      to: customerEmail,
      subject: `Payment Confirmation - Order #${orderId.substring(3, 13)}`,
      html: createPaymentConfirmationEmailTemplate(orderDetails),
    });

    if (!paymentEmailResult.success) {
      console.error(
        "[SEND-ORDER-EMAIL] Failed to send payment confirmation email:",
        paymentEmailResult.error
      );
      // Don't fail the request if payment email fails, order email already sent
    } else {
      console.log(
        "[SEND-ORDER-EMAIL] Payment confirmation email sent successfully:",
        paymentEmailResult.messageId
      );
    }

    console.log(
      "[SEND-ORDER-EMAIL] Request completed successfully for order:",
      orderId
    );
    return NextResponse.json({
      success: true,
      message: "Order confirmation emails sent successfully",
      orderId: orderId,
    });
  } catch (error) {
    console.error("[SEND-ORDER-EMAIL] Unexpected error:", error);
    console.error(
      "[SEND-ORDER-EMAIL] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send order confirmation email",
      },
      { status: 500 }
    );
  }
}
