import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [userData, onboardingStatus] = await Promise.all([
        AsyncStorage.getItem('user_data'),
        AsyncStorage.getItem('onboarding_complete')
      ]);

      const hasUser = userData !== null;
      const hasCompletedOnboarding = onboardingStatus === 'true';

      // If user exists and has completed onboarding, go to main app
      if (hasUser && hasCompletedOnboarding) {
        router.replace('./(tabs)/home');
      } else {
        // Otherwise, start onboarding flow
        router.replace('/welcome');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // On error, default to onboarding flow
      router.replace('/welcome');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // This should not render since we're redirecting
  return null;
}