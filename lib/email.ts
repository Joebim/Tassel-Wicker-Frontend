import { Resend } from "resend";

// Email configuration interface
interface EmailConfig {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

// Initialize Resend client
function createResendClient() {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn(
      "Resend API key not configured. Please set RESEND_API_KEY environment variable."
    );
    return null;
  }

  return new Resend(resendApiKey);
}

/**
 * Send an email using Resend
 * @param config Email configuration
 * @returns Promise with success status and message ID
 */
export async function sendEmail(config: EmailConfig): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const resend = createResendClient();

    if (!resend) {
      return {
        success: false,
        error:
          "Email service is not configured. Please set RESEND_API_KEY environment variable.",
      };
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      "info@tasselandwicker.com";
    const fromName =
      process.env.SMTP_FROM_NAME ||
      "Tassel & Wicker";

    // Resend expects 'to' as an array
    const toArray = Array.isArray(config.to) ? config.to : [config.to];

    // Resend expects 'cc' and 'bcc' as arrays
    const ccArray = config.cc
      ? Array.isArray(config.cc)
        ? config.cc
        : [config.cc]
      : undefined;

    const bccArray = config.bcc
      ? Array.isArray(config.bcc)
        ? config.bcc
        : [config.bcc]
      : undefined;

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: toArray,
      subject: config.subject,
      html: config.html,
      replyTo: config.replyTo,
      cc: ccArray,
      bcc: bccArray,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send email";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verify Resend connection (check API key is configured)
 * @returns Promise with verification status
 */
export async function verifySMTPConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const resend = createResendClient();

    if (!resend) {
      return {
        success: false,
        error: "Resend API key not configured",
      };
    }

    // Resend doesn't have a verify method, so we just check if the client was created
    return { success: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Resend verification failed";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
