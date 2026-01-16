import type { PaymentIntent } from "@stripe/stripe-js";
import { useAuthStore } from "@/store/authStore";
import {
  createOrder,
  type CreateOrderRequest,
} from "@/services/backend/orders";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  productId?: string;
}

interface CreateOrderFromPaymentParams {
  paymentIntent: PaymentIntent;
  cartItems: CartItem[];
  shippingMethod?: string;
  shippingCostGBP?: number;
}

/**
 * Creates an order directly by mapping Stripe PaymentIntent to the backend Order format.
 * This replaces the need for the intermediate /api/create-order-from-payment route.
 */
export async function createOrderFromPayment({
  paymentIntent,
  cartItems,
  shippingMethod = "standard",
  shippingCostGBP = 0,
}: CreateOrderFromPaymentParams) {
  // Extract details from PaymentIntent
  const shipping = paymentIntent.shipping;
  if (!shipping || !shipping.address) {
    throw new Error("Shipping address not found in payment intent");
  }

  // Extract billing address from payment method or fallback to shipping
  const billingAddress = shipping.address;
  const billingName = shipping.name || "";

  // Parse names
  const shippingNameParts = (shipping.name || "").split(" ").filter(Boolean);
  const shippingFirstName = shippingNameParts[0] || "";
  const shippingLastName = shippingNameParts.slice(1).join(" ") || "";

  const billingNameParts = billingName.split(" ").filter(Boolean);
  const billingFirstName = billingNameParts[0] || shippingFirstName || "";
  const billingLastName =
    billingNameParts.slice(1).join(" ") || shippingLastName || "";

  // Determine customer name for guest checkout
  // If user is logged in, backend will overwrite this with user's name from DB
  const user = useAuthStore.getState().user;
  let customerName: string;

  if (user) {
    customerName = `${user.firstName} ${user.lastName}`.trim();
  } else {
    customerName = `Guest - ${shippingFirstName} ${shippingLastName}`.trim();
  }

  // Ensure customerName is never empty for some reason
  if (!customerName || customerName === "Guest -") {
    customerName = "Guest";
  }

  console.log("[CreateOrderFromPayment] Customer Name:", customerName);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = shippingCostGBP || 0;
  const tax = 0;
  const discount = 0;
  const total = subtotal + shippingCost + tax - discount;

  // Map to Order Items
  const orderItems = cartItems.map((item) => ({
    productId: item.productId || item.id,
    productName: item.name,
    productImage: item.image || "",
    price: item.price,
    quantity: item.quantity,
    total: item.price * item.quantity,
  }));

  // Construct payload
  const orderRequest: CreateOrderRequest = {
    items: orderItems,
    shipping: {
      firstName: shippingFirstName,
      lastName: shippingLastName,
      company: undefined,
      address1: shipping.address.line1 || "",
      address2: shipping.address.line2 || undefined,
      city: shipping.address.city || "",
      state: shipping.address.state || "",
      postalCode: shipping.address.postal_code || "",
      country: shipping.address.country || "",
      phone: shipping.phone || undefined,
      method: shippingMethod,
      cost: shippingCost,
    },
    billing: {
      firstName: billingFirstName,
      lastName: billingLastName,
      address1: billingAddress.line1 || "",
      address2: billingAddress.line2 || undefined,
      city: billingAddress.city || "",
      state: billingAddress.state || "",
      postalCode: billingAddress.postal_code || "",
      country: billingAddress.country || "",
      phone: shipping.phone || undefined,
    },
    payment: {
      method: "card",
      status: paymentIntent.status === "succeeded" ? "paid" : "pending",
      stripePaymentIntentId: paymentIntent.id,
    },
    totals: {
      subtotal,
      shipping: shippingCost,
      tax,
      discount,
      total,
    },
    currency: paymentIntent.currency || "GBP",
    customerName: customerName,
  };

  // Call backend directly
  return createOrder(orderRequest);
}
