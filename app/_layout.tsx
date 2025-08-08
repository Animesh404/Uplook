import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider, tokenCache } from './lib/clerk';
import { AuthProvider } from './contexts/AuthContext';
import '../global.css';

export default function RootLayout() {
  return (
    <ClerkProvider 
      tokenCache={tokenCache}
      publishableKey="pk_test_c3R1bm5pbmcta2l0ZS0xLmNsZXJrLmFjY291bnRzLmRldiQ"
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
          <Stack.Screen name="sign-in-phone" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="onboarding/one" />
          <Stack.Screen name="onboarding/two" />
          <Stack.Screen name="onboarding/three" />
          <Stack.Screen name="calculating" />
          <Stack.Screen name="results" />
          <Stack.Screen name="journal" />
          <Stack.Screen name="content/[id]" />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }} 
          />
        </Stack>
      </AuthProvider>
    </ClerkProvider>
  );
}