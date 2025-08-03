import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './contexts/AuthContext';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, user, hasCompletedOnboarding, clearSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Debug info
  useEffect(() => {
    console.log('SignIn Screen - Clerk State:', {
      isLoaded,
      signInAvailable: !!signIn,
      setActiveAvailable: !!setActive
    });
  }, [isLoaded, signIn, setActive]);

  // Check if user is already signed in
  useEffect(() => {
    console.log('SignIn Screen - Auth State:', { 
      isSignedIn, 
      hasCompletedOnboarding, 
      userId: user?.id 
    });
    
          if (isSignedIn && user) {
        if (hasCompletedOnboarding) {
          console.log('User signed in and completed onboarding, going to main app');
          router.replace('/(tabs)/home');
        } else {
          console.log('User signed in but hasn\'t completed onboarding, going to onboarding');
          router.replace('/onboarding/one');
        }
      }
  }, [isSignedIn, user, hasCompletedOnboarding]);

  const handleSignIn = async () => {
    console.log('Starting sign in process...');
    console.log('Form data:', { email, passwordLength: password.length });
    
    if (!isLoaded) {
      console.log('Clerk not loaded yet');
      Alert.alert('Error', 'Authentication service is not ready. Please try again.');
      return;
    }
    
    if (!email || !password) {
      console.log('Missing required fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Signing in with Clerk...');
      const result = await signIn.create({
        identifier: email,
        password,
      });

      console.log('Sign in result:', result);
      console.log('Status:', result.status);
      console.log('Session ID:', result.createdSessionId);

      if (result.status === 'complete') {
        console.log('Sign in complete, setting active session...');
        await setActive({ session: result.createdSessionId });
        console.log('Session set active, auth state will handle redirect');
        // The useEffect will handle the redirect based on onboarding status
      } else {
        console.log('Sign in failed with status:', result.status);
        Alert.alert('Error', 'Sign in failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Handle session already exists error
      if (error.errors?.[0]?.code === 'session_exists') {
        console.log('Session already exists, clearing and retrying...');
        await clearSession();
        Alert.alert('Info', 'Please try signing in again.');
      } else if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        console.log('Error message:', errorMessage);
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'Sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    try {
      await clearSession();
      Alert.alert('Success', 'Session cleared. Please try signing in again.');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear session.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mb-6"
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>

        <View className="flex-1 justify-center">
          <Text className="text-3xl font-bold text-blue-900 mb-2">
            Welcome Back
          </Text>
          <Text className="text-blue-900 mb-8">
            Sign in to your account
          </Text>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="font-medium text-blue-900 mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white rounded-lg p-4 text-gray-800"
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="font-medium text-blue-900 mb-2">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              className="bg-white rounded-lg p-4 text-gray-800"
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoading || !isLoaded}
            className={`rounded-lg p-4 mb-4 ${isLoading || !isLoaded ? 'bg-gray-400' : 'bg-teal-500'}`}
          >
            <Text className="text-white font-medium text-center">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity className="mb-6">
            <Text className="text-center text-teal-600">
              Forgot your password?
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="items-center">
            <Text className="text-blue-900 mb-2">
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/sign-up')}>
              <Text className="text-teal-600 font-semibold">
                Sign up here
              </Text>
            </TouchableOpacity>
          </View>

          {/* Debug Info */}
          <View className="mt-6 p-4 bg-white rounded-lg">
            <Text className="text-sm text-gray-600 mb-2">Debug Info:</Text>
            <Text className="text-xs text-gray-500">Clerk Loaded: {isLoaded ? 'Yes' : 'No'}</Text>
            <Text className="text-xs text-gray-500">SignIn Available: {signIn ? 'Yes' : 'No'}</Text>
            <Text className="text-xs text-gray-500">SetActive Available: {setActive ? 'Yes' : 'No'}</Text>
            <Text className="text-xs text-gray-500">Loading: {isLoading ? 'Yes' : 'No'}</Text>
            <Text className="text-xs text-gray-500">Is Signed In: {isSignedIn ? 'Yes' : 'No'}</Text>
            <Text className="text-xs text-gray-500">Has Completed Onboarding: {hasCompletedOnboarding ? 'Yes' : 'No'}</Text>
            
            {/* Test Buttons */}
            <View className="mt-4 pt-4 border-t border-gray-200">
              <Text className="text-sm text-gray-600 mb-2">Test Options:</Text>
              <TouchableOpacity
                onPress={handleClearSession}
                className="bg-red-500 rounded-lg p-2"
              >
                <Text className="text-white text-xs text-center">Clear Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
} 