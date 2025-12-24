import { apiFetch } from "@/services/apiClient";
import type { Product } from "@/types/product";

export type ListProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  type?: "basket" | "custom" | "single";
  role?: "main" | "sub";
  featured?: boolean;
  inStock?: boolean;
};

export type ListProductsResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function listProducts(params: ListProductsParams = {}) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.search) sp.set("search", params.search);
  if (params.categoryId) sp.set("categoryId", params.categoryId);
  if (params.type) sp.set("type", params.type);
  if (params.role) sp.set("role", params.role);
  if (params.featured !== undefined)
    sp.set("featured", String(params.featured));
  if (params.inStock !== undefined) sp.set("inStock", String(params.inStock));

  const qs = sp.toString();
  return apiFetch<ListProductsResponse>(`/api/products${qs ? `?${qs}` : ""}`, {
    method: "GET",
    auth: false,
  });
}

export async function getProduct(id: string, includeLinked = false) {
  const qs = includeLinked ? "?include=linked" : "";
  return apiFetch<{ item: Product; linkedProducts?: Product[] }>(
    `/api/products/${id}${qs}`,
    {
      method: "GET",
      auth: false,
    }
  );
}

export async function listSingles() {
  return apiFetch<{ items: Product[] }>("/api/products/singles", {
    method: "GET",
    auth: false,
  });
}




