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

      // Verify payment status - only send email if payment succeeded
      if (paymentIntent.status !== 'succeeded') {
        console.warn("[SEND-ORDER-EMAIL] Payment intent status is not 'succeeded':", paymentIntent.status);
        return NextResponse.json(
          { success: false, error: `Payment status is ${paymentIntent.status}, not succeeded` },
          { status: 400 }
        );
      }
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

    // Generate email templates
    console.log("[SEND-ORDER-EMAIL] Generating email templates...");
    const orderEmailHtml = createOrderConfirmationEmailTemplate(orderDetails);
    const paymentEmailHtml = createPaymentConfirmationEmailTemplate(orderDetails);
    console.log("[SEND-ORDER-EMAIL] Email templates generated:", {
      orderEmailLength: orderEmailHtml.length,
      paymentEmailLength: paymentEmailHtml.length,
    });

    // Send order confirmation email
    console.log("[SEND-ORDER-EMAIL] ========== SENDING ORDER CONFIRMATION EMAIL ==========");
    console.log("[SEND-ORDER-EMAIL] Email Details:", {
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderId.substring(3, 13)}`,
      htmlLength: orderEmailHtml.length,
      orderId: orderId,
    });
    
    const orderEmailStartTime = Date.now();
    const orderEmailResult = await sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderId.substring(3, 13)}`,
      html: orderEmailHtml,
    });
    const orderEmailDuration = Date.now() - orderEmailStartTime;

    console.log("[SEND-ORDER-EMAIL] Order confirmation email result:", {
      success: orderEmailResult.success,
      messageId: orderEmailResult.messageId || "none",
      error: orderEmailResult.error || "none",
      duration: `${orderEmailDuration}ms`,
    });

    if (!orderEmailResult.success) {
      console.error(
        "[SEND-ORDER-EMAIL] ❌ FAILED TO SEND ORDER CONFIRMATION EMAIL:",
        {
          error: orderEmailResult.error,
          customerEmail: customerEmail,
          orderId: orderId,
          timestamp: new Date().toISOString(),
        }
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
      "[SEND-ORDER-EMAIL] ✅ ORDER CONFIRMATION EMAIL SENT SUCCESSFULLY:",
      {
        messageId: orderEmailResult.messageId,
        recipient: customerEmail,
        orderId: orderId,
        timestamp: new Date().toISOString(),
      }
    );

    // Send payment confirmation email
    console.log("[SEND-ORDER-EMAIL] ========== SENDING PAYMENT CONFIRMATION EMAIL ==========");
    console.log("[SEND-ORDER-EMAIL] Email Details:", {
      to: customerEmail,
      subject: `Payment Confirmation - Order #${orderId.substring(3, 13)}`,
      htmlLength: paymentEmailHtml.length,
      orderId: orderId,
    });
    
    const paymentEmailStartTime = Date.now();
    const paymentEmailResult = await sendEmail({
      to: customerEmail,
      subject: `Payment Confirmation - Order #${orderId.substring(3, 13)}`,
      html: paymentEmailHtml,
    });
    const paymentEmailDuration = Date.now() - paymentEmailStartTime;

    console.log("[SEND-ORDER-EMAIL] Payment confirmation email result:", {
      success: paymentEmailResult.success,
      messageId: paymentEmailResult.messageId || "none",
      error: paymentEmailResult.error || "none",
      duration: `${paymentEmailDuration}ms`,
    });

    if (!paymentEmailResult.success) {
      console.error(
        "[SEND-ORDER-EMAIL] ⚠️ FAILED TO SEND PAYMENT CONFIRMATION EMAIL (non-fatal):",
        {
          error: paymentEmailResult.error,
          customerEmail: customerEmail,
          orderId: orderId,
          note: "Order confirmation email was sent successfully",
          timestamp: new Date().toISOString(),
        }
      );
      // Don't fail the request if payment email fails, order email already sent
    } else {
      console.log(
        "[SEND-ORDER-EMAIL] ✅ PAYMENT CONFIRMATION EMAIL SENT SUCCESSFULLY:",
        {
          messageId: paymentEmailResult.messageId,
          recipient: customerEmail,
          orderId: orderId,
          timestamp: new Date().toISOString(),
        }
      );
    }

    console.log("[SEND-ORDER-EMAIL] ========== REQUEST COMPLETED SUCCESSFULLY ==========");
    const summary = {
      orderId: orderId,
      customerEmail: customerEmail,
      customerName: customerName || "not provided",
      orderEmailSent: orderEmailResult.success,
      orderEmailMessageId: orderEmailResult.messageId || "none",
      paymentEmailSent: paymentEmailResult.success,
      paymentEmailMessageId: paymentEmailResult.messageId || "none",
      totalItems: orderItems.length,
      totalAmount: totalAmount,
      currency: currency,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
    };
    console.log("[SEND-ORDER-EMAIL] Summary:", summary);
    
    // Log to console in a way that's visible in production logs
    console.log(`[EMAIL-SUCCESS] Order ${orderId} - Emails sent to ${customerEmail} at ${summary.timestamp}`);
    
    return NextResponse.json({
      success: true,
      message: "Order confirmation emails sent successfully",
      orderId: orderId,
      orderEmailMessageId: orderEmailResult.messageId,
      paymentEmailMessageId: paymentEmailResult.messageId,
      summary: summary,
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
