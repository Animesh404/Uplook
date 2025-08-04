import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireOnboarding = true 
}) => {
  const { isSignedIn, isLoading, hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isSignedIn) {
        console.log('AuthGuard: User not signed in, redirecting to auth');
        router.replace('/auth');
        return;
      }

      if (requireOnboarding && !hasCompletedOnboarding) {
        console.log('AuthGuard: User hasn\'t completed onboarding, redirecting to onboarding');
        router.replace('/onboarding/one');
        return;
      }
    }
  }, [isLoading, isSignedIn, hasCompletedOnboarding, requireOnboarding]);

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // If not signed in, show loading while redirecting
  if (!isSignedIn) {
    return (
      <View className="flex-1 items-center justify-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // If onboarding is required but not completed, show loading while redirecting
  if (requireOnboarding && !hasCompletedOnboarding) {
    return (
      <View className="flex-1 items-center justify-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // User is authenticated and has completed onboarding (if required)
  return <>{children}</>;
}; 