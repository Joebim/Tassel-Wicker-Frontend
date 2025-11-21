import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createOrderConfirmationEmailTemplate, createPaymentConfirmationEmailTemplate } from '@/lib/email-templates';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId, customerEmail, customerName } = body;

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Fetch payment intent from Stripe to get order details
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve payment intent' },
        { status: 500 }
      );
    }

    // Extract metadata
    const metadata = paymentIntent.metadata || {};
    const items = metadata.items ? JSON.parse(metadata.items) : [];
    const orderId = paymentIntent.id;
    const currency = metadata.currency || paymentIntent.currency?.toUpperCase() || 'GBP';
    
    // Calculate total amount (convert from smallest unit back to normal)
    const divisor = currency === 'JPY' ? 1 : 100;
    const totalAmount = paymentIntent.amount / divisor;

    // Extract shipping address from payment intent if available
    const shippingAddress = paymentIntent.shipping
      ? {
          name: paymentIntent.shipping.name || customerName || 'Customer',
          address: paymentIntent.shipping.address?.line1 || '',
          city: paymentIntent.shipping.address?.city || '',
          postalCode: paymentIntent.shipping.address?.postal_code || '',
          country: paymentIntent.shipping.address?.country || '',
        }
      : undefined;

    // Parse order items
    const orderItems = items.map((item: any) => ({
      id: item.id || 'unknown',
      name: item.name || 'Unknown Item',
      quantity: item.quantity || 1,
      price: item.price || 0,
    }));

    const orderDetails = {
      orderId: orderId,
      customerName: customerName || metadata.customerName || 'Valued Customer',
      customerEmail: customerEmail,
      items: orderItems,
      totalAmount: totalAmount,
      currency: currency,
      shippingAddress: shippingAddress,
      paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
      orderDate: new Date().toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    // Send order confirmation email
    const orderEmailResult = await sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderId.substring(3, 13)}`,
      html: createOrderConfirmationEmailTemplate(orderDetails),
    });

    if (!orderEmailResult.success) {
      console.error('Failed to send order confirmation email:', orderEmailResult.error);
      return NextResponse.json(
        {
          success: false,
          error: orderEmailResult.error || 'Failed to send order confirmation email',
        },
        { status: 500 }
      );
    }

    // Send payment confirmation email
    const paymentEmailResult = await sendEmail({
      to: customerEmail,
      subject: `Payment Confirmation - Order #${orderId.substring(3, 13)}`,
      html: createPaymentConfirmationEmailTemplate(orderDetails),
    });

    if (!paymentEmailResult.success) {
      console.error('Failed to send payment confirmation email:', paymentEmailResult.error);
      // Don't fail the request if payment email fails, order email already sent
    }

    return NextResponse.json({
      success: true,
      message: 'Order confirmation emails sent successfully',
      orderId: orderId,
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send order confirmation email',
      },
      { status: 500 }
    );
  }
}

