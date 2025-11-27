import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { createContactFormEmailTemplate } from "@/lib/email-templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
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

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "Resend API key is not configured in environment variables"
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

    // Get recipient email from environment or use default
    const recipientEmail =
      process.env.CONTACT_FORM_RECIPIENT ||
      process.env.RESEND_FROM ||
      process.env.SMTP_USER ||
      "info@tasselandwicker.com";

    // Send email using Resend
    try {
      const emailResult = await sendEmail({
        to: recipientEmail,
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        html: createContactFormEmailTemplate({
          name,
          email,
          message,
        }),
      });

      if (!emailResult.success) {
        console.error("Email send error:", emailResult.error);
        return NextResponse.json(
          {
            success: false,
            error:
              emailResult.error || "Failed to send email. Please try again.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Contact form submitted successfully",
        emailId: emailResult.messageId,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      const errorMessage =
        emailError instanceof Error
          ? emailError.message
          : "Failed to send email";
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details:
            emailError instanceof Error ? emailError.stack : String(emailError),
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
