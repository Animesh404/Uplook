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
        ${selected ? 'bg-[#DEFAF5] border border-[#002d62]' : 'bg-[#DEFAF5] border border-[#DEFAF5]'}
      `}
    >
      <View className="flex-row items-center">
        <View className={`
          w-8 h-8 rounded-full items-center justify-center mr-3
        `}>
          <Ionicons 
            name={icon} 
            size={18} 
            color={'#002d62'} 
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
          ? 'bg-[#002d62] border-[#002d62]' 
          : 'bg-[#DEFAF5] border-[#002d62]'}
      `}>
        {selected && <Ionicons name="checkmark" size={14} color={"white"}/>}
      </View>
    </TouchableOpacity>
  );
}