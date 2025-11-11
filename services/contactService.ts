import emailjs from "@emailjs/browser";

// EmailJS Configuration
// These values should be set as environment variables in production
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

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
      // Validate environment variables
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        return {
          success: false,
          error: "Email service is not configured. Please contact support.",
        };
      }

      // Initialize EmailJS (only needed once)
      emailjs.init(EMAILJS_PUBLIC_KEY);

      // Send email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          from_phone: formData.phone,
          message: formData.message,
          to_email: "info@tasselandwicker.com",
          reply_to: formData.email,
        },
        EMAILJS_PUBLIC_KEY
      );

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
