import React from 'react';
import { View, Text, Image } from 'react-native';

type LogoProps = {
  size?: 'small' | 'large';
};

export default function Logo({ size = 'large' }: LogoProps) {
  return (
    <View className="flex items-center justify-center">
      <View className={`bg-white rounded-lg p-2 ${size === 'small' ? 'w-10 h-10' : 'w-20 h-20'}`}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
      {size === 'large' && (
        <Text className="text-lg font-semibold mt-2 text-teal-600">Uplook</Text>
      )}
    </View>
  );
}