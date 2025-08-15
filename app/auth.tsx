import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { isSignedIn, user, hasCompletedOnboarding, clearSession } = useAuth();

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
    <SafeAreaView className="flex-1 bg-cyan-50">
      <View className="flex-1 bg-gradient-to-b from-cyan-50 to-teal-100">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 px-6 pt-4">
            {/* Header with Back Button */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity
                onPress={handleBackToWelcome}
                className="p-2 -ml-2"
              >
                <Ionicons name="arrow-back" size={24} color="#0d9488" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-blue-900 ml-2">
                Sign In
              </Text>
            </View>

            {/* Logo and Welcome */}
            <View className="items-center mb-12">
              <Image 
                source={require('../assets/images/logo.png')} 
                className="w-24 h-24 mb-6"
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold text-blue-900 mb-2 text-center">
                Welcome Back
              </Text>
              <Text className="text-blue-900 text-center text-lg">
                Sign in to continue your wellness journey
              </Text>
            </View>

            {/* Auth Options */}
            <View className="flex-1 justify-center space-y-4">
              {/* Google Sign In */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                className={`bg-white rounded-xl p-4 flex-row items-center justify-center border border-gray-200 shadow-sm ${isLoading ? 'opacity-50' : ''}`}
              >
                <Ionicons name="logo-google" size={24} color="#4285F4" />
                <Text className="text-gray-800 font-medium ml-3">
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-300" />
                <Text className="mx-4 text-gray-500 font-medium">or</Text>
                <View className="flex-1 h-px bg-gray-300" />
              </View>

              {/* Email Sign In */}
              <TouchableOpacity
                onPress={() => router.push('/sign-in')}
                disabled={isLoading}
                className={`bg-teal-500 rounded-xl p-4 flex-row items-center justify-center shadow-lg ${isLoading ? 'opacity-50' : ''}`}
              >
                <Ionicons name="mail" size={24} color="white" />
                <Text className="text-white font-medium ml-3">
                  Continue with Email
                </Text>
              </TouchableOpacity>

              {/* Phone Sign In */}
              <TouchableOpacity
                onPress={() => router.push('/sign-in-phone')}
                disabled={isLoading}
                className={`bg-blue-500 rounded-xl p-4 flex-row items-center justify-center shadow-lg ${isLoading ? 'opacity-50' : ''}`}
              >
                <Ionicons name="call" size={24} color="white" />
                <Text className="text-white font-medium ml-3">
                  Continue with Phone
                </Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View className="items-center mt-8">
                <Text className="text-blue-900 mb-2">
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push('/sign-up')}>
                  <Text className="text-teal-600 font-semibold text-lg">
                    Sign up here
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="pb-6 mt-8">
              <Text className="text-center text-gray-500 text-sm">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Debug Section - Only show in development */}
            {__DEV__ && (
              <View className="mt-6 p-4 bg-gray-100 rounded-lg">
                <Text className="text-sm text-gray-600 mb-2">Debug Options:</Text>
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await AsyncStorage.removeItem('welcome_seen');
                      Alert.alert('Success', 'Welcome screen reset. Restart the app to see it again.');
                    } catch (error) {
                      Alert.alert('Error', 'Failed to reset welcome screen.');
                    }
                  }}
                  className="bg-gray-500 rounded-lg p-2 mb-2"
                >
                  <Text className="text-white text-xs text-center">Reset Welcome Screen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleClearSession}
                  className="bg-red-500 rounded-lg p-2"
                >
                  <Text className="text-white text-xs text-center">Clear Session</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 