import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend lazily to avoid build-time errors
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

// HTML Email Template matching Tassel & Wicker aesthetics
function createEmailTemplate(formData: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Balgin', 'Mathilda', system-ui, sans-serif; background-color: #fffdf6; color: #1a1a1a;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fffdf6;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #fffdf6; border: 1px solid #e6e6e6;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background-color: #000000;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 200; letter-spacing: 2px; text-transform: uppercase;">
                                Tassel & Wicker
                            </h1>
                            <p style="margin: 10px 0 0; color: #fff6bd; font-size: 14px; font-weight: 200; letter-spacing: 1px; text-transform: uppercase;">
                                New Contact Form Submission
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 30px; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.6;">
                                You have received a new message from your website contact form.
                            </p>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                                        <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                                            Full Name
                                        </p>
                                        <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                                            ${formData.name}
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                                        <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                                            Email Address
                                        </p>
                                        <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                                            <a href="mailto:${formData.email}" style="color: #4c062c; text-decoration: none;">${formData.email}</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #e6e6e6;">
                                        <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                                            Phone Number
                                        </p>
                                        <p style="margin: 5px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200;">
                                            <a href="tel:${formData.phone}" style="color: #4c062c; text-decoration: none;">${formData.phone}</a>
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0;">
                                        <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                                            Message
                                        </p>
                                        <p style="margin: 15px 0 0; color: #1a1a1a; font-size: 16px; font-weight: 200; line-height: 1.8; white-space: pre-wrap;">
                                            ${formData.message}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e6e6e6;">
                                <p style="margin: 0; color: #6b6b6b; font-size: 12px; font-weight: 200; text-align: center;">
                                    This email was sent from the Tassel & Wicker contact form.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #1a1a1a; text-align: center;">
                            <p style="margin: 0; color: #8b8b8b; font-size: 12px; font-weight: 200; text-transform: uppercase; letter-spacing: 1px;">
                                Tassel & Wicker
                            </p>
                            <p style="margin: 5px 0 0; color: #6b6b6b; font-size: 11px; font-weight: 200;">
                                Luxury Wicker Baskets & Lifestyle Essentials
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "RESEND_API_KEY is not configured in environment variables"
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Email service is not configured. Please set RESEND_API_KEY in your environment variables.",
        },
        { status: 500 }
      );
    }

    const resend = getResend();
    if (!resend) {
      console.error("Failed to initialize Resend client");
      return NextResponse.json(
        { success: false, error: "Failed to initialize email service" },
        { status: 500 }
      );
    }

    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: "Tassel & Wicker <onboarding@resend.dev>", // Use onboarding@resend.dev for testing, update with verified domain later
        to: "tasselandwicker@gmail.com",
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        html: createEmailTemplate({ name, email, phone, message }),
      });

      if (error) {
        console.error("Resend error:", JSON.stringify(error, null, 2));
        return NextResponse.json(
          {
            success: false,
            error: error.message || "Failed to send email. Please try again.",
            details: error,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Contact form submitted successfully",
        emailId: data?.id,
      });
    } catch (resendError) {
      console.error("Resend send error:", resendError);
      const errorMessage =
        resendError instanceof Error
          ? resendError.message
          : "Failed to send email";
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details:
            resendError instanceof Error
              ? resendError.stack
              : String(resendError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Contact form error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to submit contact form";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
