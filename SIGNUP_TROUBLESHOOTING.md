# 🔍 Sign-Up Troubleshooting Guide

## Current Issue
Sign-up is not working at all. This could be due to several issues with Clerk configuration.

## ✅ FIXED: Email Verification Flow
The sign-up now properly handles email verification:

1. **User fills sign-up form** → Clerk creates user
2. **Email verification required** → User enters verification code
3. **Verification complete** → User is signed in and redirected to onboarding

## ✅ FIXED: "Already Signed In" Error
**Issue**: After email verification, you might see "You're already signed in" error.

**Cause**: Clerk automatically creates a session after successful email verification, but our code was trying to create another session.

**Solution**: The code now checks if a session was already created and handles the "already signed in" case gracefully.

## Debug Steps

### Step 1: Check Clerk Test Screen
1. **Run your app**: `npm start`
2. **Go to the Clerk Test Screen** (automatically redirected)
3. **Check the status**:
   - If it says "Clerk is loading..." and never changes → **Invalid publishable key**
   - If it says "Clerk is loaded but user is not signed in" → **Clerk is working, try sign-up**

### Step 2: Check Console Logs
Look for these logs when trying to sign up:
```
SignUp Screen - Clerk State: { isLoaded: true/false, signUpAvailable: true/false, setActiveAvailable: true/false }
Starting sign up process...
Creating user with Clerk...
Sign up result: { status: 'missing_requirements' }
Preparing email verification...
```

**After verification**:
```
LOG  Attempting email verification...
LOG  Verification result: { status: 'complete' }
LOG  Verification complete, checking for session...
LOG  Session automatically created: sess_...
LOG  Session set active, redirecting to onboarding
```

### Step 3: Test Email Authentication
1. Click **"Test Sign Up"** button on the clerk-test screen
2. Fill in the form and try to sign up
3. **Check your email** for verification code
4. **Enter the code** in the verification screen
5. Check the debug info on the sign-up screen

## Common Issues & Solutions

### Issue 1: Invalid Publishable Key
**Symptoms**: 
- "Clerk is loading..." never changes
- Console shows "The publishableKey passed to Clerk is invalid"

**Solution**:
1. Go to https://dashboard.clerk.com
2. Get your actual publishable key (starts with `pk_test_`)
3. Update both files:
   ```typescript
   // app/lib/clerk.ts
   const CLERK_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY_HERE';
   
   // app/_layout.tsx
   publishableKey="pk_test_YOUR_ACTUAL_KEY_HERE"
   ```

### Issue 2: Email Authentication Not Enabled
**Symptoms**:
- Sign-up fails with "Email authentication not enabled"

**Solution**:
1. Go to Clerk Dashboard → **User & Authentication** → **Email, Phone, Username**
2. Enable **Email**
3. Configure email settings

### Issue 3: Email Verification Not Working
**Symptoms**:
- User created but no verification email received
- Verification code doesn't work

**Solution**:
1. Check **Spam/Junk folder** for verification email
2. Verify email address is correct
3. Use **"Resend"** button if needed
4. Check Clerk Dashboard → **Email Templates** are configured

### Issue 4: "Already Signed In" Error
**Symptoms**:
- After entering verification code, see "You're already signed in" error
- User is actually signed in but error appears

**Solution**: ✅ **FIXED** - The code now handles this automatically:
- Checks if session was automatically created
- If "already signed in" error occurs, just redirects to onboarding
- No user action needed

### Issue 5: Clerk Not Loaded
**Symptoms**:
- Debug shows "Clerk Loaded: No"
- Sign-up button is disabled

**Solution**:
1. Check your internet connection
2. Verify the publishable key is correct
3. Restart the app

### Issue 6: Network Issues
**Symptoms**:
- "Cannot connect to Clerk API" error
- Sign-up times out

**Solution**:
1. Check internet connection
2. Try on different network
3. Check if any firewall is blocking Clerk

## Quick Fixes

### Fix 1: Get Real Clerk Key
```bash
# 1. Go to https://dashboard.clerk.com
# 2. Copy your publishable key
# 3. Update these files:
```

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

### Fix 2: Enable Email Authentication
1. Go to Clerk Dashboard
2. **User & Authentication** → **Email, Phone, Username**
3. Enable **Email**
4. Configure email settings

### Fix 3: Test with Simple Credentials
Try signing up with:
- **Email**: test@example.com
- **Password**: password123
- **First Name**: Test
- **Last Name**: User

## Expected Behavior

When sign-up works correctly, you should see:
```
LOG  SignUp Screen - Clerk State: { isLoaded: true, signUpAvailable: true, setActiveAvailable: true }
LOG  Starting sign up process...
LOG  Creating user with Clerk...
LOG  Sign up result: { status: 'missing_requirements' }
LOG  Preparing email verification...
```

**Then**:
1. **Check your email** for verification code
2. **Enter the code** in the verification screen
3. **See success logs**:
```
LOG  Attempting email verification...
LOG  Verification result: { status: 'complete' }
LOG  Verification complete, checking for session...
LOG  Session automatically created: sess_...
LOG  Session set active, redirecting to onboarding
```

**Note**: If you see "already signed in" error, that's normal - the user will still be redirected to onboarding.

## Debug Information

The sign-up screen now shows:
- ✅ **Clerk Loaded**: Yes/No
- ✅ **SignUp Available**: Yes/No  
- ✅ **SetActive Available**: Yes/No
- ✅ **Loading**: Yes/No

## Email Verification Flow

1. **Sign Up Form** → User enters details
2. **User Creation** → Clerk creates user account
3. **Email Verification** → Clerk sends verification code
4. **Verification Screen** → User enters 6-digit code
5. **Session Creation** → User is signed in (automatic or manual)
6. **Redirect** → User goes to onboarding

## Next Steps

1. **Get your real Clerk publishable key**
2. **Test the clerk-test screen**
3. **Try signing up with the debug info visible**
4. **Check your email for verification code**
5. **Enter the verification code**
6. **Check console logs for detailed error messages**
7. **Once working, uncomment normal flow in `app/index.tsx`**

## Need Help?

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Clerk Support**: https://clerk.com/support 