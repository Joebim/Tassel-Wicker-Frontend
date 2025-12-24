import { apiFetch } from "@/services/apiClient";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const contactService = {
  async sendEmail(
    formData: ContactFormData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use backend endpoint (docs/BACKEND_API_GUIDE.md)
      const message = formData.phone?.trim()
        ? `${formData.message}\n\nPhone: ${formData.phone}`
        : formData.message;

      await apiFetch("/api/contact", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message,
        }),
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send email. Please try again.";
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
