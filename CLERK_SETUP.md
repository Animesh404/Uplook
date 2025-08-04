# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for the Uplook app.

## Prerequisites

1. A Clerk account (sign up at https://clerk.com)
2. Your Clerk application created in the Clerk dashboard

## Setup Steps

### 1. Get Your Clerk Keys

1. Go to your Clerk Dashboard
2. Select your application
3. Go to "API Keys" in the sidebar
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. Update Frontend Configuration

1. Open `app/lib/clerk.ts`
2. Replace the placeholder publishable key:
   ```typescript
   const CLERK_PUBLISHABLE_KEY = 'pk_test_your_actual_clerk_publishable_key_here';
   ```

3. Open `app/_layout.tsx`
4. Replace the placeholder publishable key in the ClerkProvider:
   ```typescript
   <ClerkProvider 
     tokenCache={tokenCache}
     publishableKey="pk_test_your_actual_clerk_publishable_key_here"
   >
   ```

### 3. Configure Authentication Methods

In your Clerk Dashboard:

1. Go to "User & Authentication" → "Email, Phone, Username"
2. Enable the authentication methods you want:
   - **Email**: Enable email/password authentication
   - **Phone**: Enable phone number authentication
   - **Social Connections**: Enable Google, Meta (Facebook), etc.

### 4. Configure OAuth Providers (Optional)

To enable Google and Meta authentication:

#### Google OAuth:
1. Go to "User & Authentication" → "Social Connections"
2. Enable Google
3. Add your Google OAuth credentials (Client ID and Client Secret)

#### Meta (Facebook) OAuth:
1. Go to "User & Authentication" → "Social Connections"
2. Enable Meta
3. Add your Facebook App credentials

### 5. Update Server Configuration

1. Open `server/app/core/config.py`
2. Replace the placeholder Clerk secret key:
   ```python
   clerk_secret_key: str = "sk_test_your_actual_clerk_secret_key_here"
   clerk_webhook_secret: str = "whsec_your_actual_webhook_secret_here"
   ```

### 6. Configure Webhooks for FastAPI Backend

Your FastAPI backend already has the webhook endpoint configured at `/auth/webhook`. Here's how to set it up in Clerk:

#### Step 1: Start Your Development Environment

**Option A: Use the automated script (Recommended)**
```bash
cd server
./start-dev.sh
```

**Option B: Manual setup**
```bash
# Terminal 1: Start FastAPI server
cd server
python main.py

# Terminal 2: Start ngrok tunnel
ngrok http 8000
```

Your server will run on `http://localhost:8000` and ngrok will provide a public URL.

#### Step 2: Get Your Public Webhook URL

After running the development script, you'll see output like:
```
🌐 FastAPI Server: http://localhost:8000
🔗 ngrok URL: https://abc123.ngrok.io
📡 Webhook URL: https://abc123.ngrok.io/auth/webhook
```

**Copy the Webhook URL** (the one ending with `/auth/webhook`)

#### Step 3: Set Up Webhook in Clerk Dashboard

1. **Go to Clerk Dashboard** → "Webhooks"
2. **Click "Add Endpoint"**
3. **Configure the webhook**:
   - **Endpoint URL**: Use the ngrok URL from Step 2
     - **Development**: `https://abc123.ngrok.io/auth/webhook` (your ngrok URL)
     - **Production**: `https://your-domain.com/auth/webhook`
   - **Version**: Select the latest version
   - **Events**: Select these events:
     - ✅ `user.created`
     - ✅ `user.updated`
     - ✅ `user.deleted` (optional)

4. **Click "Add Endpoint"**
5. **Copy the Webhook Secret**: After creating the endpoint, copy the webhook secret (starts with `whsec_`)

#### Step 4: Update Server Configuration
1. Open `server/app/core/config.py`
2. Replace the webhook secret:
   ```python
   clerk_webhook_secret: str = "whsec_your_actual_webhook_secret_here"
   ```

#### Step 5: Test the Webhook
1. In Clerk Dashboard, go to your webhook endpoint
2. Click "Send test event"
3. Check your FastAPI server logs to see if the webhook is received
4. Verify that a user is created in your database

### 7. Environment Variables (Recommended)

For better security, use environment variables:

1. Create a `.env` file in the `server` directory:
   ```env
   CLERK_SECRET_KEY=sk_test_your_actual_clerk_secret_key_here
   CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
   DATABASE_URL=postgresql://username:password@localhost:5432/uplook_db
   ```

2. Update `server/app/core/config.py`:
   ```python
   class Settings(BaseSettings):
       # Database Configuration
       database_url: str = "postgresql://username:password@localhost:5432/uplook_db"

       # Clerk Configuration
       clerk_secret_key: str = "your_clerk_secret_key_here"
       clerk_webhook_secret: str = "your_clerk_webhook_secret_here"

       class Config:
           env_file = ".env"
   ```

## Authentication Flow

The app now supports the following authentication flow:

1. **Initial Launch**: Users are directed to the auth screen (`/auth`)
2. **Authentication Options**:
   - Google OAuth
   - Email/Password
   - Phone number verification
3. **Onboarding**: After authentication, users go through the onboarding flow
4. **Main App**: Once onboarding is complete, users access the main app

## Webhook Events Handled

Your FastAPI backend handles these Clerk webhook events:

- **`user.created`**: Creates a new user in your database
- **`user.updated`**: Updates existing user information
- **`user.deleted`**: Removes user from your database (optional)

## Features Implemented

- ✅ Multi-provider authentication (Email, Google, Meta, Phone)
- ✅ Secure token storage using expo-secure-store
- ✅ User data persistence
- ✅ Onboarding flow integration
- ✅ Profile management
- ✅ Logout functionality
- ✅ Server-side user synchronization (via webhooks)
- ✅ FastAPI webhook endpoint (`/auth/webhook`)

## Testing

1. **Start your FastAPI server**:
   ```bash
   cd server
   python main.py
   ```

2. **Start your React Native app**:
   ```bash
   npm start
   ```

3. **Test the flow**:
   - Sign up/sign in through the app
   - Check that a user is created in your database
   - Verify webhook events in Clerk Dashboard

## Troubleshooting

### Common Issues:

1. **"Invalid publishable key"**: Make sure you're using the correct publishable key from your Clerk dashboard
2. **OAuth not working**: Verify that your OAuth providers are properly configured in Clerk
3. **Webhook errors**: 
   - Check that your FastAPI server is running on the correct port
   - Verify the webhook URL is accessible
   - Check that the webhook secret matches
   - Look at your FastAPI server logs for errors

### Debug Mode:

To enable debug logging, add this to your Clerk configuration:
```typescript
<ClerkProvider 
  tokenCache={tokenCache}
  publishableKey="your_key"
  debug={true}
>
```

### Webhook Testing:

1. **Check webhook delivery** in Clerk Dashboard
2. **Monitor FastAPI logs** for webhook requests
3. **Verify database** for user creation/updates
4. **Use the development script** for easy testing:
   ```bash
   cd server
   ./start-dev.sh
   ```
5. **Check ngrok status** at http://localhost:4040
6. **Verify webhook URL** is accessible (should be HTTPS)

## Security Notes

- Never commit your Clerk secret keys to version control
- Use environment variables for sensitive configuration
- The publishable key is safe to include in client-side code
- The secret key should only be used on your server
- Always verify webhook signatures in production

## Next Steps

1. Customize the authentication UI to match your app's design
2. Add additional user profile fields as needed
3. Implement role-based access control if required
4. Add email verification flows
5. Set up password reset functionality
6. Deploy your FastAPI server and update webhook URLs 