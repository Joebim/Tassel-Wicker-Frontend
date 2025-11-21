import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { createContactFormEmailTemplate } from "@/lib/email-templates";

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

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error(
        "SMTP credentials are not configured in environment variables"
      );
      return NextResponse.json(
        {
          success: false,
          error:
            "Email service is not configured. Please set SMTP_USER and SMTP_PASSWORD in your environment variables.",
        },
        { status: 500 }
      );
    }

    // Get recipient email from environment or use default
    const recipientEmail = process.env.CONTACT_FORM_RECIPIENT || process.env.SMTP_USER || "tasselandwicker@gmail.com";

    // Send email using Google SMTP
    try {
      const emailResult = await sendEmail({
        to: recipientEmail,
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        html: createContactFormEmailTemplate({ name, email, phone, message }),
      });

      if (!emailResult.success) {
        console.error("Email send error:", emailResult.error);
        return NextResponse.json(
          {
            success: false,
            error: emailResult.error || "Failed to send email. Please try again.",
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
            emailError instanceof Error
              ? emailError.stack
              : String(emailError),
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
