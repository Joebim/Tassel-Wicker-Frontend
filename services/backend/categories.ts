import { apiFetch } from "@/services/apiClient";
import type { ProductCategory } from "@/types/product";

export async function listCategories() {
  return apiFetch<{ items: ProductCategory[] }>("/api/categories", {
    method: "GET",
    auth: false,
  });
}




