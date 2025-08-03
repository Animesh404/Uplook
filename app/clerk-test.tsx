import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function ClerkTestScreen() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const [clerkStatus, setClerkStatus] = useState('Checking...');

  useEffect(() => {
    console.log('Clerk Test - Initial State:', {
      isLoaded,
      isSignedIn,
      user: user?.id
    });

    if (!isLoaded) {
      setClerkStatus('Clerk is loading...');
    } else if (isSignedIn && user) {
      setClerkStatus('✅ Clerk is working! User is signed in.');
    } else {
      setClerkStatus('❌ Clerk is loaded but user is not signed in.');
    }
  }, [isLoaded, isSignedIn, user]);

  const testClerkConnection = async () => {
    try {
      // Try to access Clerk's public API to test connection
      const response = await fetch('https://api.clerk.com/v1/jwks');
      if (response.ok) {
        Alert.alert('Success', 'Clerk API is accessible!');
      } else {
        Alert.alert('Error', 'Clerk API returned an error');
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot connect to Clerk API');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-2xl font-bold text-blue-900 mb-6">
          Clerk Connection Test
        </Text>

        <View className="bg-white rounded-lg p-6 mb-6">
          <Text className="text-lg font-semibold mb-4">Status:</Text>
          <Text className="text-sm mb-2">{clerkStatus}</Text>
          
          <View className="mt-4 space-y-2">
            <Text className="text-xs text-gray-600">Is Loaded: {isLoaded ? '✅ Yes' : '❌ No'}</Text>
            <Text className="text-xs text-gray-600">Is Signed In: {isSignedIn ? '✅ Yes' : '❌ No'}</Text>
            <Text className="text-xs text-gray-600">User ID: {user?.id || 'None'}</Text>
            <Text className="text-xs text-gray-600">User Email: {user?.primaryEmailAddress?.emailAddress || 'None'}</Text>
            <Text className="text-xs text-gray-600">User Name: {user?.fullName || 'None'}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={testClerkConnection}
          className="bg-blue-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Test Clerk API Connection
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/auth')}
          className="bg-teal-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Go to Auth Screen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/sign-up')}
          className="bg-green-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Test Sign Up
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/sign-in')}
          className="bg-purple-500 rounded-lg p-4"
        >
          <Text className="text-white font-medium text-center">
            Test Sign In
          </Text>
        </TouchableOpacity>

        <View className="mt-6 p-4 bg-yellow-100 rounded-lg">
          <Text className="text-sm font-semibold text-yellow-800 mb-2">
            Troubleshooting Tips:
          </Text>
          <Text className="text-xs text-yellow-700 mb-1">
            • If "Clerk is loading..." never changes, check your publishable key
          </Text>
          <Text className="text-xs text-yellow-700 mb-1">
            • If "Clerk is loaded but user is not signed in", try signing up/in
          </Text>
          <Text className="text-xs text-yellow-700">
            • If API test fails, check your internet connection
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 