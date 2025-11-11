# Systeme.io API 403 Error Troubleshooting Guide

## Error: 403 Forbidden

A 403 error indicates that your request reached the Systeme.io server, but authentication/authorization failed.

## Common Causes and Solutions

### 1. **Invalid or Incorrect API Key**
- **Check**: Verify your `SYSTEME_API_KEY` in `.env.local` matches exactly what's shown in Systeme.io
- **Solution**: 
  - Go to Systeme.io → Settings → Public API keys
  - Create a new API key if needed
  - Copy it exactly (no extra spaces, no line breaks)
  - Restart your development server after updating `.env.local`

### 2. **API Key Permissions**
- **Check**: Ensure your API key has permission to create contacts
- **Solution**: 
  - In Systeme.io, check your API key settings
  - Ensure it has "Contacts" or "Write" permissions
  - Some API keys are read-only by default

### 3. **API Key Expiration**
- **Check**: Verify your API key hasn't expired
- **Solution**: 
  - Check the expiration date in Systeme.io settings
  - Create a new API key if it's expired
  - For testing, create a key without expiration

### 4. **Wrong API Endpoint**
- **Current endpoint**: `https://api.systeme.io/api/contacts`
- **Alternative to try**: `https://api.systeme.io/contacts` (without `/api/`)
- **Solution**: Check Systeme.io API documentation for the correct endpoint

### 5. **IP Whitelisting**
- **Check**: Some Systeme.io accounts require IP whitelisting
- **Solution**: 
  - Check if your Systeme.io account has IP restrictions
  - If deploying, add your server's IP to the whitelist
  - For local development, check if localhost is allowed

### 6. **Authorization Header Format**
- **Current format**: `X-API-Key: ${apiKey}` ✅
- **Note**: Systeme.io uses the `X-API-Key` header, not `Authorization: Bearer`
- **Solution**: Ensure the API key is sent in the `X-API-Key` header

### 7. **Request Body Format**
- **Current format**: 
  ```json
  {
    "email": "user@example.com",
    "locale": "en",
    "fields": []
  }
  ```
- **Solution**: Verify the request body matches Systeme.io's expected format

## Testing Steps

1. **Verify API Key is Loaded**:
   - Check server logs for "Calling Systeme.io API" message
   - Verify `hasApiKey: true` and `apiKeyLength` is reasonable (usually 20-50 characters)

2. **Test with Minimal Request**:
   - Try sending only email (no fields, no locale)
   - Remove any custom fields that might not exist in your Systeme.io account

3. **Check Systeme.io Dashboard**:
   - Log into your Systeme.io account
   - Check if there are any API usage logs or error messages
   - Verify your account is active and in good standing

4. **Test API Key Directly**:
   - Use a tool like Postman or curl to test the API key:
   ```bash
   curl -X POST https://api.systeme.io/api/contacts \
     -H "Content-Type: application/json" \
     -H "X-API-Key: YOUR_API_KEY" \
     -d '{"email":"test@example.com","locale":"en"}'
   ```

## Next Steps

If none of the above solutions work:

1. **Contact Systeme.io Support**:
   - Provide them with your API key prefix (first 10 characters)
   - Share the exact error message and status code
   - Ask them to verify your API key permissions

2. **Check Systeme.io Documentation**:
   - Review the latest API documentation
   - Check for any recent changes to the API
   - Look for API version requirements

3. **Verify Account Status**:
   - Ensure your Systeme.io account is active
   - Check if there are any account restrictions
   - Verify your subscription level supports API access

## Environment Variable Setup

Make sure your `.env.local` file contains:
```env
SYSTEME_API_KEY=your_actual_api_key_here
```

Then restart your development server:
```bash
npm run dev
```

## Debug Logging

The API route now includes detailed logging. Check your server console for:
- API endpoint being called
- API key status (hasApiKey, apiKeyLength)
- Request payload
- Response status and headers
- Error details

These logs will help identify the exact issue.

