import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Logo from './components/Logo';
import Button from './components/Button';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cyan-50">
      <View className="flex-1 justify-center items-center px-8">
        <Logo />
        
        <Text className="text-3xl font-bold text-center text-blue-900 mt-8 mb-2">
          Improve your health and find happiness
        </Text>
        
        <View className="w-full mt-12">
          <Button 
            label="Get started" 
            onPress={() => router.push('/sign-up')} 
          />
          
          <TouchableOpacity 
            className="mt-4 py-4"
            onPress={() => router.push('/(auth)/(tabs)/home' as any)}
          >
            <Text className="text-center text-sky-600">
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}