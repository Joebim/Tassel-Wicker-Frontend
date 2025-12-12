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
  const logPrefix = "[EMAIL-SERVICE]";
  const timestamp = new Date().toISOString();
  
  console.log(`${logPrefix} ========== EMAIL SEND REQUEST STARTED ==========`);
  console.log(`${logPrefix} Timestamp: ${timestamp}`);
  
  try {
    // Check Resend API key configuration
    const resendApiKey = process.env.RESEND_API_KEY;
    const hasApiKey = !!resendApiKey;
    const apiKeyLength = resendApiKey ? resendApiKey.length : 0;
    const apiKeyPrefix = resendApiKey ? resendApiKey.substring(0, 8) : "N/A";
    
    console.log(`${logPrefix} Resend API Key Check:`, {
      configured: hasApiKey,
      length: apiKeyLength,
      prefix: `${apiKeyPrefix}...`,
    });

    const resend = createResendClient();

    if (!resend) {
      console.error(`${logPrefix} CRITICAL: Resend client creation failed - API key missing`);
      return {
        success: false,
        error:
          "Email service is not configured. Please set RESEND_API_KEY environment variable.",
      };
    }

    console.log(`${logPrefix} Resend client created successfully`);

    const fromAddress =
      process.env.SMTP_FROM ||
      "info@tasselandwicker.com";
    const fromName =
      process.env.SMTP_FROM_NAME ||
      "Tassel & Wicker";

    console.log(`${logPrefix} Email Configuration:`, {
      fromAddress,
      fromName,
      fromEnv: !!process.env.SMTP_FROM,
      fromNameEnv: !!process.env.SMTP_FROM_NAME,
    });

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

    const emailPayload = {
      from: `${fromName} <${fromAddress}>`,
      to: toArray,
      subject: config.subject,
      html: config.html.substring(0, 200) + "... (truncated)", // Log first 200 chars of HTML
      replyTo: config.replyTo,
      cc: ccArray,
      bcc: bccArray,
      htmlLength: config.html.length,
    };

    console.log(`${logPrefix} Email Payload Prepared:`, {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      htmlPreview: emailPayload.html,
      htmlLength: emailPayload.htmlLength,
      replyTo: emailPayload.replyTo || "not set",
      cc: emailPayload.cc || "not set",
      bcc: emailPayload.bcc || "not set",
    });

    console.log(`${logPrefix} Sending email via Resend API...`);
    const sendStartTime = Date.now();
    
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: toArray,
      subject: config.subject,
      html: config.html,
      replyTo: config.replyTo,
      cc: ccArray,
      bcc: bccArray,
    });

    const sendDuration = Date.now() - sendStartTime;
    console.log(`${logPrefix} Resend API Response received (${sendDuration}ms):`, {
      hasData: !!data,
      hasError: !!error,
      messageId: data?.id || "none",
      errorType: error ? typeof error : "none",
    });

    if (error) {
      // Handle error - Resend error might be ErrorResponse type
      const errorObj = error as any;
      const errorMessage = errorObj?.message || "Failed to send email";
      
      console.error(`${logPrefix} RESEND API ERROR:`, {
        error: error,
        errorMessage: errorMessage,
        errorType: typeof error,
        errorString: String(error),
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log(`${logPrefix} EMAIL SENT SUCCESSFULLY:`, {
      messageId: data?.id,
      recipient: toArray.join(", "),
      subject: config.subject,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error(`${logPrefix} EXCEPTION IN EMAIL SERVICE:`, {
      error: error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      errorName: error instanceof Error ? error.name : "Unknown",
      errorStack: error instanceof Error ? error.stack : "No stack trace",
      timestamp: new Date().toISOString(),
    });
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
