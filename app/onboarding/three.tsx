import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useOnboarding } from '../contexts/OnboardingContext'; // Import useOnboarding
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '@clerk/clerk-expo';
import ProgressHeader from '../components/ProgressHeader';
import Button from '../components/Button';
import SelectableOption from '../components/SelectableOption';

type ReminderTime = {
  id: string;
  label: string;
  icon: string;
  selected: boolean;
};

export default function OnboardingThree() {
  const { data, updateData } = useOnboarding(); // Use onboarding context
  const { completeOnboarding } = useAuth();
  const { user: clerkUser } = useUser();
  
  const [reminderTimes, setReminderTimes] = useState<ReminderTime[]>([
    { id: '1', label: 'Morning', icon: 'sunny', selected: data.reminderTimes.includes('Morning') },
    { id: '2', label: 'Noon', icon: 'partly-sunny', selected: data.reminderTimes.includes('Noon') },
    { id: '3', label: 'Evening', icon: 'moon', selected: data.reminderTimes.includes('Evening') },
  ]);

  const toggleReminderTime = (id: string) => {
    setReminderTimes(reminderTimes.map(time =>
      time.id === id ? { ...time, selected: !time.selected } : time
    ));
  };

  const handleContinue = async () => {
    try {
      const selectedTimes = reminderTimes.filter(time => time.selected).map(time => time.label);
      updateData({ reminderTimes: selectedTimes }); // Save data to context
      console.log('full name', data.fullName);
      console.log('email', data.email);
      console.log('age', data.age);
      console.log('goals', data.goals);
      console.log('reminderTimes', selectedTimes);
      // Complete onboarding and save user data
      await completeOnboarding({
        fullName: data.fullName,
        email: data.email,
        age: data.age,
        goals: data.goals,
        reminderTimes: selectedTimes,
      });

      router.push('/calculating');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  const handleSkip = async () => {
    try {
      const selectedTimes = reminderTimes.filter(time => time.selected).map(time => time.label);
      updateData({ reminderTimes: selectedTimes }); // Save data even on skip

      // Complete onboarding and save user data
      await completeOnboarding({
        fullName: data.fullName,
        email: data.email,
        age: data.age,
        goals: data.goals,
        reminderTimes: selectedTimes,
      });

      router.push('/calculating');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  // Get user's first name for personalization
  const getUserFirstName = () => {
    const name = data.fullName || clerkUser?.fullName || '';
    return name.split(' ')[0] || 'there';
  };

  // Get personalized message based on selected goals
  const getPersonalizedMessage = () => {
    if (data.goals && data.goals.length > 0) {
      const primaryGoal = data.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return 'Set reminders to help you build a consistent meditation practice';
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return 'Choose times that work best for your workout routine';
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return 'Set evening reminders to prepare for better sleep';
      } else if (primaryGoal.toLowerCase().includes('stress')) {
        return 'Regular reminders will help you manage stress throughout the day';
      }
    }
    return 'When would you like to be reminded to practice your wellness activities?';
  };

  // Get personalized title based on selected goals
  const getPersonalizedTitle = () => {
    if (data.goals && data.goals.length > 0) {
      const primaryGoal = data.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return 'Set your meditation reminders';
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return 'Set your workout reminders';
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return 'Set your sleep reminders';
      } else if (primaryGoal.toLowerCase().includes('stress')) {
        return 'Set your stress management reminders';
      }
    }
    return 'When would you like to be reminded?';
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        <ProgressHeader
          step={3}
          totalSteps={3}
          onBack={() => router.back()}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-teal-100 rounded-xl p-6">
            <Text className="text-2xl font-bold text-blue-900 mb-1">
              {getPersonalizedTitle()}
            </Text>
            <Text className="text-blue-900 mb-6">
              {getPersonalizedMessage()}
            </Text>

            {reminderTimes.map(time => (
              <SelectableOption
                key={time.id}
                icon={time.icon as any}
                label={time.label}
                selected={time.selected}
                onSelect={() => toggleReminderTime(time.id)}
              />
            ))}

            <View className="mt-6">
              <Button
                label="Complete Setup"
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
            </View>

            {/* Summary of user's choices */}
            <View className="mt-6 p-4 bg-white rounded-lg">
              <Text className="text-sm text-gray-600 mb-2">Your Setup Summary:</Text>
              <Text className="text-xs text-gray-500 mb-1">Name: {data.fullName || 'Not provided'}</Text>
              <Text className="text-xs text-gray-500 mb-1">Age: {data.age || 'Not provided'}</Text>
              <Text className="text-xs text-gray-500 mb-1">Email: {data.email || 'Not provided'}</Text>
              {data.goals && data.goals.length > 0 && (
                <Text className="text-xs text-gray-500 mb-1">
                  Goals: {data.goals.join(', ')}
                </Text>
              )}
              {reminderTimes.filter(time => time.selected).length > 0 && (
                <Text className="text-xs text-gray-500">
                  Reminders: {reminderTimes.filter(time => time.selected).map(time => time.label).join(', ')}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}