import React from 'react';
import { Stack } from 'expo-router';
import '../global.css';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f0fdf9' }
      }}
    />
  );
}