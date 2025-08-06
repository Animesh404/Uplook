# 🔑 Clerk Keys Setup - Fix Authentication Issues

## Current Issue
Your app is showing: `The publishableKey passed to Clerk is invalid`

## Quick Fix Steps

### 1. Get Your Real Clerk Keys

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Select your application** (or create one if you haven't)
3. **Go to API Keys** in the sidebar
4. **Copy your Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 2. Update Your App

Replace the placeholder key in these files:

**File: `app/lib/clerk.ts`**
```typescript
const CLERK_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY_HERE';
```

**File: `app/_layout.tsx`**
```typescript
<ClerkProvider 
  tokenCache={tokenCache}
  publishableKey="pk_test_YOUR_ACTUAL_KEY_HERE"
>
```

### 3. Configure Authentication Methods

In your Clerk Dashboard:

1. **Go to User & Authentication** → **Email, Phone, Username**
2. **Enable Email**: Turn on email/password authentication
3. **Go to Social Connections**
4. **Enable Google**: Add your Google OAuth credentials

### 4. Test the Authentication

1. **Run your app**: `npm start`
2. **Go to test screen**: `/test-clerk` (automatically redirected)
3. **Check authentication status**
4. **Try signing in** with email or Google

### 5. Debug Information

The test screen will show:
- ✅ Is Signed In: Yes/No
- ✅ Is Loaded: Yes/No
- User details (if signed in)

### 6. Common Issues

**"Invalid publishable key"**
- Make sure you're using the key from your Clerk dashboard
- Check that the key starts with `pk_test_` or `pk_live_`

**"OAuth not working"**
- Verify Google OAuth is enabled in Clerk dashboard
- Check that you've added Google OAuth credentials

**"Email sign-in not working"**
- Make sure email authentication is enabled in Clerk dashboard

### 7. Once Working

1. **Update `app/index.tsx`** to use normal flow:
   ```typescript
   // Comment out the test redirect
   // router.replace('/test-clerk');
   
   // Uncomment normal flow
   checkAuthState();
   ```

2. **Remove test screen** from navigation if not needed

## Need Help?

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Support**: https://clerk.com/support 