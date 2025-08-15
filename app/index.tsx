import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, isLoading, hasCompletedOnboarding, isSignedIn } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      checkAuthState();
    }
  }, [isLoading, isSignedIn, user, hasCompletedOnboarding]);

  const checkAuthState = async () => {
    console.log('Index - Checking auth state:', { 
      isSignedIn, 
      hasCompletedOnboarding, 
      userId: user?.id 
    });
    
    try {
      // Check if user has seen the welcome screen
      const welcomeSeen = await AsyncStorage.getItem('welcome_seen');
      setHasSeenWelcome(welcomeSeen === 'true');
      
      // If user is signed in and has completed onboarding, go to main app
      if (isSignedIn && hasCompletedOnboarding && user) {
        console.log('User signed in and completed onboarding, going to main app');
        router.replace('/(auth)/(tabs)/home' as any);
      } else if (isSignedIn && !hasCompletedOnboarding) {
        // User is signed in but hasn't completed onboarding
        console.log('User signed in but hasn\'t completed onboarding, going to onboarding');
        router.replace('/onboarding/one');
      } else if (!isSignedIn && !hasSeenWelcome) {
        // New user who hasn't seen welcome screen
        console.log('New user, showing welcome screen');
        router.replace('/welcome');
      } else {
        // User is not signed in and has seen welcome, go to auth screen
        console.log('User not signed in and has seen welcome, going to auth screen');
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Fallback to auth screen
      router.replace('/auth');
    }
    
    setIsInitializing(false);
  };

  if (isLoading || isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // This should not render since we're redirecting
  return null;
}