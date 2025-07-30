import React from 'react';
import { Stack } from 'expo-router';
import '../global.css'

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f0fdf9' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding/one" />
      <Stack.Screen name="onboarding/two" />
      <Stack.Screen name="onboarding/three" />
      <Stack.Screen name="calculating" />
      <Stack.Screen name="results" />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }} 
      />
    </Stack>
  );
}