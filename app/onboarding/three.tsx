import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
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
  const [reminderTimes, setReminderTimes] = useState<ReminderTime[]>([
    { id: '1', label: 'Morning', icon: 'sunny', selected: true },
    { id: '2', label: 'Noon', icon: 'partly-sunny', selected: false },
    { id: '3', label: 'Evening', icon: 'moon', selected: false },
  ]);

  const toggleReminderTime = (id: string) => {
    setReminderTimes(reminderTimes.map(time => 
      time.id === id ? { ...time, selected: !time.selected } : time
    ));
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
              When would you like to be reminded?
            </Text>
            <Text className="text-blue-900 mb-6">
              Turn on the notifications
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
                label="Continue" 
                onPress={() => router.push('/calculating')} 
              />
              
              <TouchableOpacity 
                className="mt-3"
                onPress={() => router.push('/calculating')}
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