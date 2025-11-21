# Email Troubleshooting Guide

## Issue: No Email Received After Checkout

If you completed a checkout but didn't receive an email, here's what was fixed and how to verify it's working.

## What Was Fixed

### 1. **Client-Side Email Fallback**
   - Added a new API route `/api/send-order-email` that can be called directly from the payment success page
   - This ensures emails are sent even if the Stripe webhook isn't configured or reachable
   - The payment success page now automatically sends order confirmation emails

### 2. **Improved Customer Email Capture**
   - Customer email and name are now stored in localStorage during checkout
   - Payment intent now includes `receipt_email` in the confirmation parameters
   - Webhook checks multiple sources for customer email (receipt_email, billing_details.email, metadata)

### 3. **Enhanced Webhook Logging**
   - Added detailed console logging to help debug email sending issues
   - Logs show which email sources were checked and whether emails were sent successfully

## How It Works Now

### Flow 1: Webhook (Production)
1. Customer completes payment
2. Stripe sends `payment_intent.succeeded` event to webhook
3. Webhook extracts customer email from payment intent
4. Webhook sends order confirmation and payment confirmation emails

### Flow 2: Client-Side Fallback (Development/Backup)
1. Customer completes payment
2. Customer is redirected to `/payment-success` page
3. Page extracts payment intent ID from URL
4. Page retrieves customer email from localStorage
5. Page calls `/api/send-order-email` API route
6. API route fetches payment intent from Stripe and sends emails

## Testing

### Test 1: Check Browser Console
1. Complete a test checkout
2. Open browser developer tools (F12)
3. Check the Console tab for:
   - "Order confirmation email sent successfully" message
   - Any error messages

### Test 2: Check Server Logs
1. Check your server/terminal logs for:
   - "Payment intent succeeded" log with payment details
   - "Sending order confirmation email to: [email]" log
   - "Order confirmation email sent successfully" log
   - Any error messages

### Test 3: Verify SMTP Configuration
Make sure these environment variables are set:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Tassel & Wicker
```

### Test 4: Check Email Spam Folder
- Sometimes emails can end up in spam/junk folders
- Check your spam folder if you don't see the email in your inbox

## Common Issues

### Issue: "No customer email found"
**Cause**: Customer email wasn't captured during checkout
**Solution**: 
- Check that the checkout form has an email field
- Verify localStorage has `checkout_customer_email` set
- Check browser console for warnings

### Issue: "SMTP authentication failed"
**Cause**: Incorrect Google App Password or SMTP credentials
**Solution**:
- Verify you're using an App Password, not your regular Gmail password
- Ensure 2-Step Verification is enabled on your Google account
- Double-check SMTP_USER and SMTP_PASSWORD in environment variables

### Issue: "Webhook signature verification failed"
**Cause**: STRIPE_WEBHOOK_SECRET is missing or incorrect
**Solution**:
- Get the webhook signing secret from Stripe Dashboard
- Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`
- For local development, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Issue: Emails not sending in local development
**Cause**: Webhook can't reach localhost
**Solution**:
- Use the client-side fallback (automatic on payment success page)
- Or use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Or use ngrok to expose your local server

## Debugging Steps

1. **Check Environment Variables**
   ```bash
   # Verify SMTP is configured
   echo $SMTP_USER
   echo $SMTP_PASSWORD
   ```

2. **Test SMTP Connection**
   - The email service includes a `verifySMTPConnection()` function
   - You can create a test endpoint to verify SMTP is working

3. **Check Stripe Dashboard**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Check if webhook events are being received
   - Look for any failed webhook attempts

4. **Check Server Logs**
   - Look for console.log messages from the webhook
   - Check for any error messages

5. **Test Email Service Directly**
   - You can test the email service by calling the contact form
   - If contact form emails work, SMTP is configured correctly

## Next Steps

If emails still aren't being sent:
1. Check all environment variables are set correctly
2. Verify Google App Password is correct
3. Check server logs for specific error messages
4. Test the contact form to verify SMTP is working
5. Check Stripe webhook configuration in dashboard

