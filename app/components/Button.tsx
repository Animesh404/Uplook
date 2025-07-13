import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({ 
  label, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  loading = false
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        w-full py-4 rounded-full items-center justify-center
        ${isPrimary 
          ? 'bg-indigo-600' 
          : 'bg-sky-300'}
        ${disabled ? 'opacity-50' : ''}
      `}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={`
          font-semibold text-center
          ${isPrimary ? 'text-white' : 'text-sky-800'}
        `}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}