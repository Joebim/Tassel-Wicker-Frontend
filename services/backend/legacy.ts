import { apiFetch } from "@/services/apiClient";

export async function createPaymentIntent(payload: {
  amount: number;
  currency?: string;
  items?: unknown[];
  metadata?: Record<string, unknown>;
  fxQuoteId?: string | null;
}) {
  return apiFetch<{ clientSecret: string; paymentIntentId: string }>(
    "/api/create-payment-intent",
    {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }
  );
}

export async function updatePaymentIntent(payload: {
  paymentIntentId: string;
  amount: number;
  currency?: string;
}) {
  return apiFetch<{ success: boolean; clientSecret?: string; amount?: number }>(
    "/api/update-payment-intent",
    {
      method: "POST",
      auth: false,
      body: JSON.stringify(payload),
    }
  );
}

export async function getShippingRate(payload: { rateId: string }) {
  return apiFetch<{
    id: string;
    amount: number;
    currency: string;
    displayName: string;
  }>("/api/get-shipping-rate", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function fxQuotePost(payload: {
  toCurrency?: string;
  fromCurrencies?: string[];
  lockDuration?: string;
}) {
  return apiFetch<any>("/api/fx-quote", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function fxQuoteGet(id: string) {
  return apiFetch<any>(`/api/fx-quote?id=${encodeURIComponent(id)}`, {
    method: "GET",
    auth: false,
  });
}

export async function sendOrderEmail(payload: {
  paymentIntentId: string;
  customerEmail: string;
  customerName?: string;
}) {
  return apiFetch<any>("/api/send-order-email", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function contact(payload: {
  name: string;
  email: string;
  message: string;
}) {
  return apiFetch<any>("/api/contact", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function newsletter(payload: {
  email: string;
  locale?: string;
  fields?: Array<{ slug: string; value: string }>;
}) {
  return apiFetch<any>("/api/newsletter", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}





