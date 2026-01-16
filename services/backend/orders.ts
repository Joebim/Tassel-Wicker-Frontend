import { apiFetch } from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";
import type { Order } from "@/types/order";

export type AdminOrdersResponse = {
  items: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function listMyOrders() {
  return apiFetch<{ items: Order[] }>("/api/orders/my", {
    method: "GET",
    auth: true,
  });
}

export async function getOrder(id: string) {
  return apiFetch<{ item: Order }>(`/api/orders/${id}`, {
    method: "GET",
    auth: true,
  });
}

export async function listAdminOrders(
  params: { page?: number; limit?: number } = {}
) {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page || 1));
  sp.set("limit", String(params.limit || 20));
  return apiFetch<AdminOrdersResponse>(
    `/api/orders/admin/list?${sp.toString()}`,
    { method: "GET", auth: true }
  );
}

export async function updateAdminOrder(
  id: string,
  payload: { status?: string; trackingNumber?: string }
) {
  return apiFetch<{ item: Order }>(`/api/orders/admin/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  shipping: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    method: string;
    cost: number;
    trackingNumber?: string;
  };
  billing: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  payment: {
    method: string;
    status: "pending" | "paid" | "failed" | "refunded";
    transactionId?: string;
    stripePaymentIntentId?: string;
    stripeCheckoutSessionId?: string;
  };
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  currency?: string;
  customerName?: string;
  notes?: string;
}

export async function createOrder(orderData: CreateOrderRequest) {
  const token = useAuthStore.getState().token;
  return apiFetch<{ item: Order }>("/api/orders", {
    method: "POST",
    auth: !!token,
    body: JSON.stringify(orderData),
  });
}
