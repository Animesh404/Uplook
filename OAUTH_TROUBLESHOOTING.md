# 🔍 Google OAuth Troubleshooting Guide

## Current Issue
From the logs, we can see:
```
LOG  Starting Google OAuth flow...
LOG  OAuth flow completed, sessionId: 
LOG  No session created or setActive not available
```

This means the OAuth flow completes but no session is created.

## Possible Causes & Solutions

### 1. Google OAuth Not Configured in Clerk

**Check in Clerk Dashboard:**
1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **User & Authentication** → **Social Connections**
4. Check if **Google** is enabled
5. If not enabled, click **Enable** and configure:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret

### 2. Google OAuth Credentials Missing

**To get Google OAuth credentials:**
1. Go to https://console.cloud.google.com
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: Add your Clerk redirect URI
   - **Authorized JavaScript origins**: Add your app domain

### 3. Redirect URI Mismatch

**Check your Clerk redirect URI:**
1. In Clerk Dashboard, go to **User & Authentication** → **Social Connections**
2. Click on **Google** settings
3. Copy the **Redirect URI**
4. Make sure this URI is added to your Google OAuth credentials

### 4. Test Email Authentication First

**To isolate the issue:**
1. Try the **"Test Email Sign In"** button on the auth screen
2. If email works but Google doesn't, the issue is with Google OAuth configuration
3. If neither works, the issue is with Clerk configuration

### 5. Check Clerk Publishable Key

**Verify your key is correct:**
1. In Clerk Dashboard, go to **API Keys**
2. Copy the **Publishable Key**
3. Make sure it starts with `pk_test_` or `pk_live_`
4. Update both files:
   - `app/lib/clerk.ts`
   - `app/_layout.tsx`

## Debug Steps

### Step 1: Test Email Authentication
1. Click **"Test Email Sign In"** on the auth screen
2. Try to sign up with email/password
3. Check if this works

### Step 2: Check Clerk Configuration
1. Go to Clerk Dashboard
2. Verify Google OAuth is enabled
3. Check that credentials are configured

### Step 3: Check Console Logs
Look for these logs when trying Google sign-in:
- `Starting Google OAuth flow...`
- `OAuth flow completed, result:`
- `SessionId:`
- `SetActive available:`

### Step 4: Test with Different OAuth Provider
If Google doesn't work, try:
1. Enable **GitHub** OAuth in Clerk
2. Add GitHub OAuth button to test

## Quick Fixes to Try

### Fix 1: Enable Email Authentication
If Google OAuth isn't working, use email authentication for now:
1. Go to Clerk Dashboard
2. **User & Authentication** → **Email, Phone, Username**
3. Enable **Email**
4. Test with email sign-in

### Fix 2: Check Network Issues
1. Make sure you have internet connection
2. Try on different network
3. Check if any firewall is blocking OAuth

### Fix 3: Clear App Data
1. Clear app cache/storage
2. Restart the app
3. Try OAuth again

## Expected Behavior After Fix

When Google OAuth works correctly, you should see:
```
LOG  Starting Google OAuth flow...
LOG  OAuth flow completed, result: { createdSessionId: "sess_...", setActive: [Function] }
LOG  SessionId: sess_...
LOG  SetActive available: true
LOG  Setting active session...
LOG  Session set active, redirecting to onboarding
```

## Need Help?

- **Clerk Documentation**: https://clerk.com/docs/authentication/social-connections/google
- **Google OAuth Setup**: https://developers.google.com/identity/protocols/oauth2
- **Clerk Support**: https://clerk.com/support 