import nodemailer from 'nodemailer';

// Email configuration interface
interface EmailConfig {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

// Initialize nodemailer transporter with Google SMTP
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom =
    process.env.SMTP_FROM || smtpUser || "info@tasselandwicker.com";

  if (!smtpUser || !smtpPassword) {
    console.warn(
      'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.'
    );
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    // For Gmail, you may need to enable "Less secure app access" or use App Password
    // See: https://support.google.com/accounts/answer/185833
  });
}

/**
 * Send an email using Google SMTP
 * @param config Email configuration
 * @returns Promise with success status and message ID
 */
export async function sendEmail(config: EmailConfig): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return {
        success: false,
        error: 'Email service is not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.',
      };
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      "info@tasselandwicker.com";
    const fromName = process.env.SMTP_FROM_NAME || 'Tassel & Wicker';

    const mailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to: Array.isArray(config.to) ? config.to.join(', ') : config.to,
      subject: config.subject,
      html: config.html,
      replyTo: config.replyTo,
      cc: config.cc ? (Array.isArray(config.cc) ? config.cc.join(', ') : config.cc) : undefined,
      bcc: config.bcc ? (Array.isArray(config.bcc) ? config.bcc.join(', ') : config.bcc) : undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to send email';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verify SMTP connection
 * @returns Promise with verification status
 */
export async function verifySMTPConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return {
        success: false,
        error: 'SMTP transporter not configured',
      };
    }

    await transporter.verify();
    return { success: true };
  } catch (error) {
    console.error('SMTP verification error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'SMTP verification failed';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

