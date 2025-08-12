import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity,Platform,StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useUser } from '@clerk/clerk-expo';
import ProgressHeader from '../components/ProgressHeader';
import Button from '../components/Button';
import SelectableOption from '../components/SelectableOption';

type Goal = {
  id: string;
  label: string;
  icon: string;
  selected: boolean;
};

export default function OnboardingTwo() {
  const { data, updateData } = useOnboarding();
  const { user: clerkUser } = useUser();
  
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', label: 'Meditation', icon: 'leaf', selected: data.goals.includes('Meditation') },
    { id: '2', label: 'Exercise', icon: 'fitness', selected: data.goals.includes('Exercise') },
    { id: '3', label: 'Sleep', icon: 'moon', selected: data.goals.includes('Sleep') },
    { id: '4', label: 'Stress Management', icon: 'heart', selected: data.goals.includes('Stress Management') },
    { id: '5', label: 'Gratitude', icon: 'star', selected: data.goals.includes('Gratitude') },
    { id: '6', label: 'Self-confidence', icon: 'sunny', selected: data.goals.includes('Self-confidence') },
  ]);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, selected: !goal.selected } : goal
    ));
  };

  const handleContinue = () => {
    const selectedGoals = goals.filter(goal => goal.selected).map(goal => goal.label);
    updateData({ goals: selectedGoals });
    router.push('/onboarding/three');
  };

  const handleSkip = () => {
    const selectedGoals = goals.filter(goal => goal.selected).map(goal => goal.label);
    updateData({ goals: selectedGoals });
    router.push('/onboarding/three');
  };

  // Get user's first name for personalization
  const getUserFirstName = () => {
    const name = data.fullName || clerkUser?.fullName || '';
    return name.split(' ')[0] || 'there';
  };

  // Get personalized message based on selected goals
  const getPersonalizedMessage = () => {
    const selectedCount = goals.filter(goal => goal.selected).length;
    if (selectedCount === 0) {
      return 'What would you like to work on?';
    } else if (selectedCount === 1) {
      return 'Great choice! Let\'s focus on that.';
    } else if (selectedCount <= 3) {
      return 'Excellent! These goals will help you grow.';
    } else {
      return 'Ambitious! We\'ll help you balance these goals.';
    }
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <View className="flex-1 bg-cyan-50">
      <SafeAreaView className="flex-1">
        <View className="flex-1 px-4 pt-4" style={{ paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16 }}>
          <ProgressHeader
            step={2}
            totalSteps={3}
            onBack={() => router.back()}
          />

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1 -mx-4">
            <View className="bg-teal-200 rounded-3xl p-6  mt-4">
              <Text className="text-2xl font-bold text-blue-900 mb-1">
                What are your goals, {getUserFirstName()}?
              </Text>
              <Text className="text-blue-900 mb-6">
                {getPersonalizedMessage()}
              </Text>

              {goals.map(goal => (
                <SelectableOption
                  key={goal.id}
                  icon={goal.icon as any}
                  label={goal.label}
                  selected={goal.selected}
                  onSelect={() => toggleGoal(goal.id)}
                />
              ))}

              <View className="mt-6">
                <View className= "mb-4">
                  <Button
                    label="Continue"
                    onPress={handleContinue}
                  />
                </View>
                

              <TouchableOpacity className="bg-cyan-300/60 rounded-2xl py-4 px-6" onPress={handleSkip}>
                <Text className="text-center text-blue-900 font-semibold text-lg">Skip</Text>
              </TouchableOpacity>
              </View>

              {/* Progress indicator */}
              <View className="mt-6 p-4 bg-white rounded-lg">
                <Text className="text-sm text-gray-600 mb-2">Selected Goals:</Text>
                {goals.filter(goal => goal.selected).length > 0 ? (
                  goals.filter(goal => goal.selected).map(goal => (
                    <View key={goal.id} className="flex-row items-center mb-1">
                      <Ionicons name="checkmark-circle" size={16} color="#0d9488" />
                      <Text className="text-sm text-gray-700 ml-2">{goal.label}</Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-sm text-gray-500 italic">No goals selected yet</Text>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
    
  );
}