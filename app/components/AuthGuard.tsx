import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireOnboarding = true,
  fallback
}) => {
  const { isSignedIn, isLoading, hasCompletedOnboarding } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // If not signed in, show fallback or loading
  if (!isSignedIn) {
    return fallback || (
      <View className="flex-1 items-center justify-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // If onboarding is required but not completed, show fallback or loading
  if (requireOnboarding && !hasCompletedOnboarding) {
    return fallback || (
      <View className="flex-1 items-center justify-center bg-cyan-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // User is authenticated and has completed onboarding (if required)
  return <>{children}</>;
}; 