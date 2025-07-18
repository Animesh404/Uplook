import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
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
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', label: 'Self-improvement', icon: 'rocket', selected: true },
    { id: '2', label: 'Reduce stress', icon: 'leaf', selected: false },
    { id: '3', label: 'Be more mindful', icon: 'heart', selected: true },
    { id: '4', label: 'Improve sleep', icon: 'moon', selected: false },
    { id: '5', label: 'Feel better', icon: 'happy', selected: false },
  ]);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, selected: !goal.selected } : goal
    ));
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        <ProgressHeader 
          step={2} 
          totalSteps={3} 
          onBack={() => router.back()} 
        />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-teal-100 rounded-xl p-6">
            <Text className="text-2xl font-bold text-blue-900 mb-1">
              What is your goal?
            </Text>
            <Text className="text-blue-900 mb-6">
              Select all that apply to you
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
              <Button 
                label="Continue" 
                onPress={() => router.push('/onboarding/three')} 
              />
              
              <TouchableOpacity 
                className="mt-3"
                onPress={() => router.push('/onboarding/three')}
              >
                <Text className="text-center text-blue-900 py-4">
                  Skip
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}