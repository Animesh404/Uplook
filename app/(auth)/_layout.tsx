import React from 'react';
import { Stack } from 'expo-router';
import { ProtectedLayout } from '../components/ProtectedLayout';

export default function AuthLayout() {
  return (
    <ProtectedLayout requireOnboarding={true}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="journal" />
        <Stack.Screen name="content/[id]" />
        <Stack.Screen name="calculating" />
        <Stack.Screen name="results" />
      </Stack>
    </ProtectedLayout>
  );
}
