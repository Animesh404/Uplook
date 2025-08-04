import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useAuth } from '../contexts/AuthContext';
import ProgressHeader from '../components/ProgressHeader';
import Button from '../components/Button';

export default function OnboardingOne() {
  const { user: clerkUser } = useUser();
  const { data, updateData } = useOnboarding();
  const { completeOnboarding, isSignedIn, user } = useAuth();

  const [fullName, setFullName] = useState(data.fullName);
  const [age, setAge] = useState(data.age);
  const [email, setEmail] = useState(data.email);
  const [agreeToTerms, setAgreeToTerms] = useState(data.agreeToTerms);

  // Pre-fill with Clerk user data if available
  useEffect(() => {
    if (clerkUser) {
      const clerkFullName = clerkUser.fullName || '';
      const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress || '';

      setFullName(clerkFullName || data.fullName);
      setEmail(clerkEmail || data.email);
    }
  }, [clerkUser]);

  // Debug info
  useEffect(() => {
    console.log('Onboarding One - Auth State:', {
      isSignedIn,
      clerkUser: clerkUser?.id,
      authUser: user?.id,
      fullName: clerkUser?.fullName
    });
  }, [isSignedIn, clerkUser, user]);

  const handleContinue = async () => {
    if (!agreeToTerms) {
      // Show error or alert
      return;
    }

    updateData({
      fullName,
      age,
      email,
      agreeToTerms,
    });
    router.push('/onboarding/two');
  };

  const handleSkip = async () => {
    updateData({
      fullName,
      age,
      email,
      agreeToTerms,
    });
    router.push('/onboarding/two');
  };

  // Get user's first name for personalization
  const getUserFirstName = () => {
    const name = fullName || clerkUser?.fullName || '';
    return name.split(' ')[0] || 'there';
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        <ProgressHeader
          step={1}
          totalSteps={3}
          onBack={() => router.back()}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-teal-100 rounded-xl p-6">
            <Text className="text-2xl font-bold text-blue-900 mb-1">
              Nice to meet you, {getUserFirstName()}!
            </Text>
            <Text className="text-blue-900 mb-6">
              Let's get to know you better to personalize your wellness journey
            </Text>

            <View className="mb-4">
              <Text className="font-medium text-blue-900 mb-2">Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                className="bg-white rounded-lg p-4 text-gray-800"
              />
            </View>

            <View className="mb-4">
              <Text className="font-medium text-blue-900 mb-2">Age</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                keyboardType="number-pad"
                className="bg-white rounded-lg p-4 text-gray-800"
              />
            </View>

            <View className="mb-6">
              <Text className="font-medium text-blue-900 mb-2">Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white rounded-lg p-4 text-gray-800"
                editable={!clerkUser?.primaryEmailAddress?.emailAddress}
              />
            </View>

            <TouchableOpacity
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              className="flex-row items-center mb-8"
            >
              <View className={`
                w-5 h-5 rounded border mr-2 items-center justify-center
                ${agreeToTerms ? 'bg-teal-500 border-teal-500' : 'border-gray-400'}
              `}>
                {agreeToTerms && <Ionicons name="checkmark" size={12} color="white" />}
              </View>
              <Text className="text-blue-900">
                I agree with the <Text className="text-teal-600">Terms and Conditions</Text>
              </Text>
            </TouchableOpacity>

            <Button
              label="Continue"
              onPress={handleContinue}
            />

            <TouchableOpacity
              className="mt-3"
              onPress={handleSkip}
            >
              <Text className="text-center text-blue-900 py-4">
                Skip
              </Text>
            </TouchableOpacity>

            {/* Debug Info */}
            <View className="mt-6 p-4 bg-white rounded-lg">
              <Text className="text-sm text-gray-600 mb-2">Debug Info:</Text>
              <Text className="text-xs text-gray-500">Is Signed In: {isSignedIn ? 'Yes' : 'No'}</Text>
              <Text className="text-xs text-gray-500">Clerk User: {clerkUser?.id || 'None'}</Text>
              <Text className="text-xs text-gray-500">Auth User: {user?.id || 'None'}</Text>
              <Text className="text-xs text-gray-500">Name: {clerkUser?.fullName || 'None'}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}