/**
 * Email templates for Tassel & Wicker
 * All templates use the brand's luxury aesthetic
 */

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: string;
  orderDate?: string;
}

/**
 * Base email template wrapper
 */
function getBaseEmailTemplate(content: string, title?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Tassel & Wicker'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Balgin', 'Mathilda', system-ui, sans-serif; background-color: #ffffff; color: #1a1a1a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e6e6e6;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background-color: #000000;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 200; letter-spacing: 2px; text-transform: uppercase;">
                                Tassel & Wicker
                            </h1>
                            ${title ? `<p style="margin: 10px 0 0; color: #fff6bd; font-size: 14px; font-weight: 200; letter-spacing: 1px; text-transform: uppercase;">${title}</p>` : ''}
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #1a1a1a; text-align: center;">
                            <p style="margin: 0; color: #8b8b8b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                                Tassel & Wicker
                            </p>
                            <p style="margin: 5px 0 0; color: #6b6b6b; font-size: 11px; font-weight: 200;">
                                Luxury Wicker Baskets & Lifestyle Essentials
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}

/**
 * Contact form submission email template
 */
export function createContactFormEmailTemplate(formData: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): string {
  const content = `
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        You have received a new message from your website contact form.
    </p>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                    Full Name
                </p>
                <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                    ${formData.name}
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                    Email Address
                </p>
                <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                    <a href="mailto:${formData.email}" style="color: #4c062c; text-decoration: none;">${formData.email}</a>
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                    Phone Number
                </p>
                <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                    <a href="tel:${formData.phone}" style="color: #4c062c; text-decoration: none;">${formData.phone}</a>
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 15px 0;">
                <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                    Message
                </p>
                <p style="margin: 15px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.8; white-space: pre-wrap;">
                    ${formData.message}
                </p>
            </td>
        </tr>
    </table>
    
    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e6e6e6;">
        <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-align: center;">
            This email was sent from the Tassel & Wicker contact form.
        </p>
    </div>
  `;

  return getBaseEmailTemplate(content, 'New Contact Form Submission');
}

/**
 * Order confirmation email template (sent to customer)
 */
export function createOrderConfirmationEmailTemplate(order: OrderDetails): string {
  const formatPrice = (amount: number, currency: string): string => {
    const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'NGN' ? '₦' : '';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const itemsList = order.items
    .map(
      (item) => `
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                    ${item.name} × ${item.quantity}
                </p>
            </td>
            <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6; text-align: right;">
                <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                    ${formatPrice(item.price * item.quantity, order.currency)}
                </p>
            </td>
        </tr>
    `
    )
    .join('');

  const shippingInfo = order.shippingAddress
    ? `
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                    Shipping Address
                </p>
                <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
                    ${order.shippingAddress.name}<br>
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                    ${order.shippingAddress.country}
                </p>
            </td>
        </tr>
    `
    : '';

  const content = `
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        Dear ${order.customerName},
    </p>
    
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        Thank you for your order! We're delighted to confirm that your order has been received and is being processed.
    </p>
    
    <div style="margin-bottom: 30px; padding: 20px; background-color: #f9f9f9; border-left: 3px solid #4c062c;">
        <p style="margin: 0 0 10px; color: #1a1a1a; font-size: 14px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
            Order Number
        </p>
        <p style="margin: 0; color: #4c062c; font-size: 24px; font-weight: 200; letter-spacing: 2px;">
            ${order.orderId}
        </p>
        ${order.orderDate ? `<p style="margin: 10px 0 0; color: #6b6b6b; font-size: 12px; font-weight: 200;">Order Date: ${order.orderDate}</p>` : ''}
    </div>
    
    <h2 style="margin: 30px 0 20px; color: #1a1a1a; font-size: 20px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
        Order Details
    </h2>
    
    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        ${itemsList}
        <tr>
            <td style="padding: 20px 0 0; border-top: 2px solid #1a1a1a;" colspan="2">
                <p style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: 200; text-align: right;">
                    <strong>Total: ${formatPrice(order.totalAmount, order.currency)}</strong>
                </p>
            </td>
        </tr>
    </table>
    
    ${shippingInfo}
    
    ${order.paymentMethod ? `
        <tr>
            <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                    Payment Method
                </p>
                <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                    ${order.paymentMethod}
                </p>
            </td>
        </tr>
    ` : ''}
    
    <div style="margin-top: 40px; padding: 20px; background-color: #f9f9f9;">
        <p style="margin: 0 0 15px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
            <strong>What's Next?</strong>
        </p>
        <p style="margin: 0; color: #6b6b6b; font-size: 14px; font-weight: 200; line-height: 1.6;">
            We'll send you another email once your order has been shipped with tracking information. If you have any questions, please don't hesitate to contact us.
        </p>
    </div>
    
    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e6e6e6;">
        <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-align: center;">
            Thank you for choosing Tassel & Wicker.
        </p>
    </div>
  `;

  return getBaseEmailTemplate(content, 'Order Confirmation');
}

/**
 * Payment confirmation email template (sent to customer)
 */
export function createPaymentConfirmationEmailTemplate(order: OrderDetails): string {
  const formatPrice = (amount: number, currency: string): string => {
    const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'NGN' ? '₦' : '';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const content = `
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        Dear ${order.customerName},
    </p>
    
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        We're pleased to confirm that your payment of <strong>${formatPrice(order.totalAmount, order.currency)}</strong> has been successfully processed.
    </p>
    
    <div style="margin-bottom: 30px; padding: 20px; background-color: #f0f9f0; border-left: 3px solid #4c062c;">
        <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
            ✓ Payment confirmed for Order #${order.orderId}
        </p>
    </div>
    
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        Your order is now being prepared for shipment. You'll receive a shipping confirmation email with tracking details once your items are on their way.
    </p>
    
    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e6e6e6;">
        <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-align: center;">
            If you have any questions about your order, please contact us at <a href="mailto:${process.env.SMTP_USER || 'info@tasselandwicker.com'}" style="color: #4c062c; text-decoration: none;">${process.env.SMTP_USER || 'info@tasselandwicker.com'}</a>
        </p>
    </div>
  `;

  return getBaseEmailTemplate(content, 'Payment Confirmation');
}

/**
 * Shipping notification email template (sent to customer)
 */
export function createShippingNotificationEmailTemplate(order: OrderDetails, trackingNumber?: string): string {
  const content = `
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        Dear ${order.customerName},
    </p>
    
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        Great news! Your order #${order.orderId} has been shipped and is on its way to you.
    </p>
    
    ${trackingNumber ? `
        <div style="margin-bottom: 30px; padding: 20px; background-color: #f9f9f9; border-left: 3px solid #4c062c;">
            <p style="margin: 0 0 10px; color: #1a1a1a; font-size: 14px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                Tracking Number
            </p>
            <p style="margin: 0; color: #4c062c; font-size: 18px; font-weight: 200; letter-spacing: 1px;">
                ${trackingNumber}
            </p>
        </div>
    ` : ''}
    
    <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
        You can track your shipment using the tracking number above. We expect your order to arrive within 5-7 business days.
    </p>
    
    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e6e6e6;">
        <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-align: center;">
            Thank you for your patience. We hope you love your Tassel & Wicker items!
        </p>
    </div>
  `;

  return getBaseEmailTemplate(content, 'Your Order Has Shipped');
}

