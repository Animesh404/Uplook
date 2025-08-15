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
    <View className="flex-row items-center justify-between w-full mb-4 relative">
      {/* Back Button */}
      <TouchableOpacity onPress={onBack} className="p-2">
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Centered Logo Group */}
      <View className="absolute left-1/2 -translate-x-1/2 flex-row items-center">
        <Logo size="small" />
        <Text className="text-[#2C3E50] text-[18px] font-medium">
          Uplook
        </Text>
      </View>

      {/* Step Counter */}
      <Text className="text-[#4B42B6]">
        {step}/{totalSteps}
      </Text>
    </View>

  );
}