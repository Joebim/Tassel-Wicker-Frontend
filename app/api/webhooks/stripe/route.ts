import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";
import {
  createOrderConfirmationEmailTemplate,
  createPaymentConfirmationEmailTemplate,
} from "@/lib/email-templates";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      console.error("Missing Stripe signature or webhook secret");
      return NextResponse.json(
        { success: false, error: "Missing webhook configuration" },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { success: false, error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle payment intent succeeded event
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as any;

      console.log("Payment intent succeeded:", {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        receipt_email: paymentIntent.receipt_email,
        metadata: paymentIntent.metadata,
      });

      try {
        // Extract metadata
        const metadata = paymentIntent.metadata || {};
        const items = metadata.items ? JSON.parse(metadata.items) : [];
        // Try multiple sources for customer email
        const customerEmail =
          paymentIntent.receipt_email ||
          paymentIntent.billing_details?.email ||
          metadata.customerEmail ||
          "";
        const customerName =
          metadata.customerName ||
          paymentIntent.billing_details?.name ||
          "Valued Customer";
        const orderId = paymentIntent.id;
        const currency =
          metadata.currency || paymentIntent.currency?.toUpperCase() || "GBP";

        // Calculate total amount (convert from smallest unit back to normal)
        const divisor = currency === "JPY" ? 1 : 100;
        const totalAmount = paymentIntent.amount / divisor;

        // Extract shipping address from payment intent if available
        const shippingAddress = paymentIntent.shipping
          ? {
              name: paymentIntent.shipping.name || customerName,
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
          customerName: customerName,
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

        // Send order confirmation email to customer
        if (customerEmail) {
          console.log("Sending order confirmation email to:", customerEmail);

          const orderEmailResult = await sendEmail({
            to: customerEmail,
            subject: `Order Confirmation - Order #${orderId.substring(3, 13)}`,
            html: createOrderConfirmationEmailTemplate(orderDetails),
          });

          if (orderEmailResult.success) {
            console.log(
              "Order confirmation email sent successfully:",
              orderEmailResult.messageId
            );
          } else {
            console.error(
              "Failed to send order confirmation email:",
              orderEmailResult.error
            );
          }

          // Send payment confirmation email
          const paymentEmailResult = await sendEmail({
            to: customerEmail,
            subject: `Payment Confirmation - Order #${orderId.substring(
              3,
              13
            )}`,
            html: createPaymentConfirmationEmailTemplate(orderDetails),
          });

          if (paymentEmailResult.success) {
            console.log(
              "Payment confirmation email sent successfully:",
              paymentEmailResult.messageId
            );
          } else {
            console.error(
              "Failed to send payment confirmation email:",
              paymentEmailResult.error
            );
          }
        } else {
          console.warn(
            "No customer email found in payment intent. Sources checked:",
            {
              receipt_email: paymentIntent.receipt_email,
              billing_details_email: paymentIntent.billing_details?.email,
              metadata_customerEmail: metadata.customerEmail,
            }
          );
        }

        // Send notification to admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail) {
          await sendEmail({
            to: adminEmail,
            subject: `New Order Received - Order #${orderId.substring(3, 13)}`,
            html: `
              <h2>New Order Received</h2>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Customer:</strong> ${customerName} (${
              customerEmail || "No email"
            })</p>
              <p><strong>Total:</strong> ${currency} ${totalAmount.toFixed(
              2
            )}</p>
              <p><strong>Items:</strong> ${orderItems.length}</p>
            `,
          });
        }

        return NextResponse.json({
          success: true,
          message: "Payment processed and emails sent",
          orderId: orderId,
        });
      } catch (emailError) {
        console.error("Error sending order confirmation emails:", emailError);
        // Don't fail the webhook if email fails
        return NextResponse.json({
          success: true,
          message: "Payment processed but email sending failed",
          error:
            emailError instanceof Error ? emailError.message : "Unknown error",
        });
      }
    }

    // Handle other event types if needed
    return NextResponse.json({
      success: true,
      message: `Event ${event.type} received`,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
