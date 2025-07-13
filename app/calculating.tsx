import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Logo from './components/Logo';

export default function CalculatingScreen() {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Simulate calculation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setIsDone(true);
          return 95;
        }
        return prev + 5;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        <View className="flex-row items-center justify-between w-full mb-4">
          <View className="w-8" />
          <View className="flex-row items-center">
            <Logo size="small" />
            <Text className="ml-2 text-teal-600 font-medium">Uplook</Text>
          </View>
          <Text className="text-gray-500" />
        </View>
        
        <View className="flex-1 items-center justify-center">
          <Text className="text-2xl font-bold text-blue-900 mb-8 text-center">
            Calculating your results
          </Text>
          
          <View className="w-16 h-16 mb-16">
            {/* Hourglass icon */}
            <View className="w-16 h-16 items-center justify-center">
              <View className="absolute w-12 h-12 bg-blue-900 rotate-45 rounded-sm" />
            </View>
          </View>
          
          <Text className="text-blue-900 mb-8">
            {progress}% calculating
          </Text>
          
          <View className="w-full">
            <TouchableOpacity
              onPress={() => router.push('/results')}
              className={`
                w-full py-4 rounded-full flex-row items-center justify-center
                ${isDone ? 'bg-indigo-600' : 'bg-indigo-400'}
              `}
              disabled={!isDone}
            >
              <Text className="text-white font-semibold mr-2">Done</Text>
              <Ionicons name="checkmark" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}