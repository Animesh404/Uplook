import React from 'react';
import { Stack } from 'expo-router';
import { OnboardingProvider } from '../contexts/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="one" />
        <Stack.Screen name="two" />
        <Stack.Screen name="three" />
      </Stack>
    </OnboardingProvider>
  );
}