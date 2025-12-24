import { apiFetch } from "@/services/apiClient";

export async function uploadProductImage(file: File) {
  const form = new FormData();
  form.append("file", file);

  return apiFetch<{ success: boolean; url: string; publicId?: string }>(
    "/api/uploads/product-image",
    {
      method: "POST",
      auth: true,
      body: form,
    }
  );
}




