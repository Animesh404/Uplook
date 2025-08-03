import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function TestClerkScreen() {
  const { isSignedIn, signOut } = useAuth();
  const { user, isLoaded } = useUser();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-teal-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-2xl font-bold text-blue-900 mb-6">
          Clerk Test Screen
        </Text>

        <View className="bg-white rounded-lg p-6 mb-6">
          <Text className="text-lg font-semibold mb-4">Authentication Status:</Text>
          <Text className="mb-2">Is Signed In: {isSignedIn ? '✅ Yes' : '❌ No'}</Text>
          <Text className="mb-2">Is Loaded: {isLoaded ? '✅ Yes' : '❌ No'}</Text>
          
          {user && (
            <>
              <Text className="mb-2">User ID: {user.id}</Text>
              <Text className="mb-2">Email: {user.primaryEmailAddress?.emailAddress || 'N/A'}</Text>
              <Text className="mb-2">Name: {user.fullName || 'N/A'}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/auth')}
          className="bg-teal-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Go to Auth Screen
          </Text>
        </TouchableOpacity>

        {isSignedIn && (
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-500 rounded-lg p-4"
          >
            <Text className="text-white font-medium text-center">
              Sign Out
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
} 