import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SelectableOptionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export default function SelectableOption({ 
  icon, 
  label, 
  selected, 
  onSelect 
}: SelectableOptionProps) {
  return (
    <TouchableOpacity 
      onPress={onSelect}
      className={`
        flex-row items-center justify-between p-4 rounded-lg mb-3
        ${selected ? 'bg-white border border-teal-500' : 'bg-white border border-gray-200'}
      `}
    >
      <View className="flex-row items-center">
        <View className={`
          w-8 h-8 rounded-full items-center justify-center mr-3
          ${selected ? 'bg-teal-100' : 'bg-gray-100'}
        `}>
          <Ionicons 
            name={icon} 
            size={18} 
            color={selected ? '#0d9488' : '#9ca3af'} 
          />
        </View>
        <Text className={`
          font-medium
          ${selected ? 'text-teal-800' : 'text-gray-700'}
        `}>
          {label}
        </Text>
      </View>
      
      <View className={`
        w-6 h-6 rounded-full border items-center justify-center
        ${selected 
          ? 'bg-teal-500 border-teal-500' 
          : 'bg-white border-gray-300'}
      `}>
        {selected && <Ionicons name="checkmark" size={14} color="white" />}
      </View>
    </TouchableOpacity>
  );
}