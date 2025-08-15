import React from 'react';
import { View, Text, Image } from 'react-native';

type LogoProps = {
  size?: 'small' | 'large';
};

export default function Logo({ size = 'large' }: LogoProps) {
  return (
    <View className="flex items-center justify-center">
      <View
        className={`bg-transparent rounded-2xl ${
          size === 'small' ? 'w-16 h-12' : 'w-32 h-24'
        } flex items-center justify-center`}
      >
        <Image
          source={require('../../assets/images/uplook.png')}
          className="w-12 h-9" // keep fixed aspect ratio
          resizeMode="contain"
        />
      </View>
    </View>

  );
}