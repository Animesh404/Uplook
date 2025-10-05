import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';

export default function OAuthCallback() {
  const { isSignedIn, hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    // Small delay to ensure auth state is updated
    const timer = setTimeout(() => {
      if (isSignedIn) {
        if (hasCompletedOnboarding) {
          router.replace('/(auth)/(tabs)/home' as any);
        } else {
          router.replace('/onboarding/one');
        }
      } else {
        // If not signed in, go back to auth screen
        router.replace('/auth');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSignedIn, hasCompletedOnboarding]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0ffff' }}>
      <ActivityIndicator size="large" color="#60e2e2" />
      <Text style={{ marginTop: 16, color: '#64748b' }}>
        Completing sign in...
      </Text>
    </View>
  );
}