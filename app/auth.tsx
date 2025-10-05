import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, Platform, StatusBar } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from './components/Logo';

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { isSignedIn, user, hasCompletedOnboarding, clearSession } = useAuth();

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 44;

  // Check if user is already signed in
  useEffect(() => {
    console.log('Auth Screen - Auth State:', { 
      isSignedIn, 
      hasCompletedOnboarding, 
      userId: user?.id 
    });
    
    if (isSignedIn && user) {
      if (hasCompletedOnboarding) {
        console.log('User signed in and completed onboarding, going to main app');
        router.replace('/(auth)/(tabs)/home' as any);
      } else {
        console.log('User signed in but hasn\'t completed onboarding, going to onboarding');
        router.replace('/onboarding/one');
      }
    }
  }, [isSignedIn, user, hasCompletedOnboarding]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google OAuth flow...');
      
      const result = await startOAuthFlow();
      
      console.log('OAuth flow completed, result:', result);
      console.log('SessionId:', result.createdSessionId);
      console.log('SetActive available:', !!result.setActive);
      
      if (result.createdSessionId && result.setActive) {
        console.log('Setting active session...');
        await result.setActive({ session: result.createdSessionId });
        console.log('Session set active, checking auth state...');
        // The useEffect will handle the redirect based on onboarding status
      } else if (result.createdSessionId) {
        console.log('Session created but setActive not available, checking auth state...');
        // The useEffect will handle the redirect based on onboarding status
      } else {
        console.log('No session created, checking if user is already signed in...');
        // Check if the user is already signed in after OAuth
        setTimeout(() => {
          if (isSignedIn) {
            console.log('User is signed in, auth state will handle redirect');
          } else {
            console.log('User is still not signed in, showing error');
            Alert.alert('Error', 'Failed to complete sign in. Please try again.');
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Handle session already exists error
      if (error.errors?.[0]?.code === 'session_exists') {
        console.log('Session already exists, clearing and retrying...');
        await clearSession();
        Alert.alert('Info', 'Please try signing in again.');
      } else {
        Alert.alert('Error', error.errors?.[0]?.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    router.push('/welcome');
  };

  const handleClearSession = async () => {
    try {
      await clearSession();
      Alert.alert('Success', 'Session cleared successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear session.');
    }
  };

  return (
    <View className="flex-1 bg-[#f0ffff]">
      {/* Header */}
      <View style={{ paddingTop: statusBarHeight, paddingHorizontal: 16 }}>
        <View className="flex-row items-center justify-between w-full mb-8">
          <TouchableOpacity
            onPress={handleBackToWelcome}
            className="p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#0d9488" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Logo size="small" />
            <Text className="text-[#2C3E50] text-[18px] font-medium">Uplook</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Main content area */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6">
          {/* Welcome Card */}
          <View
            style={{
              backgroundColor: "#60e2e2",
              borderRadius: 24,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-[#0f172a] mb-2 text-center">
                Welcome Back
              </Text>
              <Text className="text-[#1e293b] text-center text-base">
                Sign in to continue your wellness journey
              </Text>
            </View>

            {/* Auth Options */}
            <View className="space-y-3">
              {/* Google Sign In */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                style={{
                  backgroundColor: "#ebffff",
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Ionicons name="logo-google" size={24} color="#4285F4" />
                <Text className="text-[#0f172a] font-semibold ml-3 text-base">
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-[#1e293b]/20" />
                <Text className="mx-4 text-[#1e293b] font-medium">or</Text>
                <View className="flex-1 h-px bg-[#1e293b]/20" />
              </View>

              {/* Email Sign In */}
              <TouchableOpacity
                onPress={() => router.push('/sign-in')}
                disabled={isLoading}
                style={{
                  backgroundColor: "#88d2f2",
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#002d62",
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Ionicons name="mail" size={24} color="#0f172a" />
                <Text className="text-[#0f172a] font-semibold ml-3 text-base">
                  Continue with Email
                </Text>
              </TouchableOpacity>

              {/* Phone Sign In */}
              <TouchableOpacity
                onPress={() => router.push('/sign-in-phone')}
                disabled={isLoading}
                style={{
                  backgroundColor: "#88d2f2",
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#002d62",
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                <Ionicons name="call" size={24} color="#0f172a" />
                <Text className="text-[#0f172a] font-semibold ml-3 text-base">
                  Continue with Phone
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Link */}
          <View
            style={{
              backgroundColor: "#ebffff",
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text className="text-[#0f172a] mb-2 text-base">
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/sign-up')}>
              <Text className="text-[#0d9488] font-semibold text-lg">
                Sign up here
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="pb-6">
            <Text className="text-center text-[#64748b] text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

          {/* Debug Section - Only show in development */}
          {__DEV__ && (
            <View className="mb-6 p-4 bg-white/70 rounded-xl">
              <Text className="text-sm text-gray-600 mb-3 font-semibold">Debug Options:</Text>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await AsyncStorage.removeItem('welcome_seen');
                    Alert.alert('Success', 'Welcome screen reset. Restart the app to see it again.');
                  } catch (error) {
                    Alert.alert('Error', 'Failed to reset welcome screen.');
                  }
                }}
                style={{
                  backgroundColor: "#64748b",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <Text className="text-white text-xs text-center font-medium">Reset Welcome Screen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearSession}
                style={{
                  backgroundColor: "#ef4444",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text className="text-white text-xs text-center font-medium">Clear Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}