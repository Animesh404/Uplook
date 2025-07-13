import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from './Logo';

type ProgressHeaderProps = {
  step: 1 | 2 | 3;
  totalSteps: number;
  onBack: () => void;
};

export default function ProgressHeader({ step, totalSteps, onBack }: ProgressHeaderProps) {
  return (
    <View className="flex-row items-center justify-between w-full mb-4">
      <TouchableOpacity onPress={onBack} className="p-2">
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <View className="flex-row items-center">
        <Logo size="small" />
        <Text className="ml-2 text-teal-600 font-medium">Uplook</Text>
      </View>
      
      <Text className="text-gray-500">
        {step}/{totalSteps}
      </Text>
    </View>
  );
}