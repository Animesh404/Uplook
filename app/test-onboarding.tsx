import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { useOnboarding } from './contexts/OnboardingContext';

export default function TestOnboardingScreen() {
  const { user, hasCompletedOnboarding, completeOnboarding } = useAuth();
  const { data, updateData } = useOnboarding();

  useEffect(() => {
    console.log('=== ONBOARDING TEST SCREEN ===');
    console.log('User:', user);
    console.log('Has Completed Onboarding:', hasCompletedOnboarding);
    console.log('Onboarding Data:', data);
  }, [user, hasCompletedOnboarding, data]);

  const testCompleteOnboarding = async () => {
    try {
      console.log('Testing onboarding completion...');
      
      // Set test data
      const testData = {
        fullName: 'Test User',
        email: 'test@example.com',
        age: '25',
        goals: ['Meditation', 'Exercise'],
        reminderTimes: ['Morning', 'Evening']
      };

      updateData(testData);
      
      await completeOnboarding(testData);
      
      Alert.alert('Success', 'Onboarding completed successfully!');
              router.replace('/(auth)/(tabs)/home' as any);
    } catch (error) {
      console.error('Test failed:', error);
      Alert.alert('Error', 'Test failed: ' + (error as Error).message);
    }
  };

  const testDataUsage = () => {
    console.log('=== TESTING DATA USAGE ===');
    console.log('Current user data:', user);
    console.log('Personalization check:');
    console.log('- First name:', user?.fullName?.split(' ')[0] || 'Not available');
    console.log('- Goals:', user?.goals || 'No goals set');
    console.log('- Reminder times:', user?.reminderTimes || 'No reminders set');
    
    Alert.alert('Data Check', `
      Name: ${user?.fullName || 'Not set'}
      Goals: ${user?.goals?.join(', ') || 'None'}
      Reminders: ${user?.reminderTimes?.join(', ') || 'None'}
    `);
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-blue-900 mb-6 text-center">
          Onboarding Test Screen
        </Text>

        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-blue-900 mb-2">Current State:</Text>
          <Text className="text-blue-800">User ID: {user?.id || 'Not set'}</Text>
          <Text className="text-blue-800">Name: {user?.fullName || 'Not set'}</Text>
          <Text className="text-blue-800">Completed: {hasCompletedOnboarding ? 'Yes' : 'No'}</Text>
          <Text className="text-blue-800">Goals: {user?.goals?.length || 0}</Text>
        </View>

        <TouchableOpacity
          onPress={testCompleteOnboarding}
          className="bg-teal-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Test Complete Onboarding
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={testDataUsage}
          className="bg-blue-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Test Data Usage
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/onboarding/one')}
          className="bg-purple-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Go to Onboarding
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/(tabs)/home' as any)}
          className="bg-green-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Go to Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-500 rounded-lg p-4"
        >
          <Text className="text-white font-medium text-center">
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}