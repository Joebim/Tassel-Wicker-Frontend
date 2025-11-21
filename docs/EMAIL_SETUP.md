# Email Setup Guide - Google SMTP

This guide explains how to configure Google SMTP for sending transactional emails in the Tassel & Wicker application.

## Prerequisites

- A Google account (Gmail)
- 2-Step Verification enabled on your Google account

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the prompts to enable 2-Step Verification

## Step 2: Generate an App Password

1. After enabling 2-Step Verification, go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter a name like "Tassel & Wicker SMTP"
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this for your environment variables)

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Google SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Tassel & Wicker

# Email Recipients
CONTACT_FORM_RECIPIENT=recipient@example.com  # Where contact form submissions are sent
ADMIN_EMAIL=admin@example.com  # Where order notifications are sent
```

### Environment Variable Descriptions

- **SMTP_HOST**: SMTP server hostname (default: `smtp.gmail.com`)
- **SMTP_PORT**: SMTP server port (587 for TLS, 465 for SSL)
- **SMTP_USER**: Your Gmail address
- **SMTP_PASSWORD**: The 16-character app password generated in Step 2
- **SMTP_FROM**: The email address that will appear as the sender
- **SMTP_FROM_NAME**: The display name for the sender
- **CONTACT_FORM_RECIPIENT**: Email address where contact form submissions are sent
- **ADMIN_EMAIL**: Email address where admin notifications (new orders) are sent

## Step 4: Test the Configuration

You can test your SMTP configuration by:

1. Submitting the contact form on your website
2. Completing a test order (use Stripe test mode)
3. Checking that emails are received

## Email Types Sent

The application automatically sends the following emails:

### 1. Contact Form Submissions
- **Trigger**: When a user submits the contact form
- **Recipient**: `CONTACT_FORM_RECIPIENT` environment variable
- **Reply-To**: Customer's email address

### 2. Order Confirmation
- **Trigger**: When a payment is successfully processed (via Stripe webhook)
- **Recipient**: Customer's email address
- **Content**: Order details, items, shipping address, total amount

### 3. Payment Confirmation
- **Trigger**: When a payment is successfully processed (via Stripe webhook)
- **Recipient**: Customer's email address
- **Content**: Payment confirmation details

### 4. Admin Order Notification
- **Trigger**: When a new order is received (via Stripe webhook)
- **Recipient**: `ADMIN_EMAIL` environment variable
- **Content**: New order summary

## Troubleshooting

### "Authentication failed" error

- Verify that 2-Step Verification is enabled
- Ensure you're using an App Password, not your regular Gmail password
- Check that the App Password is correctly copied (no spaces)

### "Connection timeout" error

- Verify your firewall isn't blocking port 587
- Try using port 465 with SSL instead (change `SMTP_PORT=465` and update the secure setting)

### Emails not being received

- Check spam/junk folders
- Verify the recipient email addresses in your environment variables
- Check server logs for error messages
- Ensure the Stripe webhook is properly configured (for order emails)

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use App Passwords instead of your main Google password**
3. **Rotate App Passwords periodically**
4. **Use environment-specific email addresses for testing**
5. **Monitor email sending for unusual activity**

## Alternative SMTP Providers

While this guide focuses on Google SMTP, you can use other SMTP providers by updating the environment variables:

- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port `587`
- **Yahoo**: `smtp.mail.yahoo.com`, port `587`
- **Custom SMTP**: Use your provider's SMTP settings

Just update `SMTP_HOST` and `SMTP_PORT` accordingly.

