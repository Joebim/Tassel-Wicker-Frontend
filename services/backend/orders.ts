import { apiFetch } from "@/services/apiClient";
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









