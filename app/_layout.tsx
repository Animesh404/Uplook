import React from 'react';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider, tokenCache } from './lib/clerk';
import { AuthProvider } from './contexts/AuthContext';
import '../global.css';

export default function RootLayout() {
  if (__DEV__) {
    // Suppress noisy Reanimated warnings in development terminal
    const originalWarn = console.warn;
    const originalLog = console.log;
    const shouldSuppress = (msg: unknown) =>
      typeof msg === 'string' && msg.startsWith('[Reanimated]');

    console.warn = (...args: unknown[]) => {
      if (args.length > 0 && shouldSuppress(args[0])) return;
      originalWarn(...args as any);
    };

    console.log = (...args: unknown[]) => {
      if (args.length > 0 && shouldSuppress(args[0])) return;
      originalLog(...args as any);
    };
  }

  const publishableKey = Constants.expoConfig?.extra?.eas?.clerk_public_key;

  return (
    <ClerkProvider 
      tokenCache={tokenCache}
      publishableKey={publishableKey}
    >
      <AuthProvider>
        <StatusBar style="dark" backgroundColor="#f0fdf9" translucent={false} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#f0fdf9' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="clerk-test" />
          <Stack.Screen name="sign-in-phone" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </AuthProvider>
    </ClerkProvider>
  );
}