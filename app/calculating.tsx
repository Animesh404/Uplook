import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, Platform, StatusBar} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthGuard } from './components/AuthGuard';

export default function CalculatingScreen() {
  return <CalculatingScreenContent />;
}

function CalculatingScreenContent() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const calculationSteps = [
    "Analyzing your goals...",
    "Creating personalized plan...",
    "Setting up your reminders...",
    "Preparing your dashboard...",
    "Almost ready..."
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsDone(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < calculationSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const handleContinue = () => {
    router.push('/results');
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView className="flex-1 bg-cyan-50">
      <View className="flex-1 bg-gradient-to-b from-cyan-50 to-teal-100" style={{  paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16   }}>
        <View className="flex-1 px-6 pt-4">
          {/* Header */}
          <View className="flex-row items-center justify-center w-full mb-8">
            <Image 
              source={require('../assets/images/logo.png')} 
              className="w-8 h-8"
              resizeMode="contain"
            />
            <Text className="ml-2 text-teal-600 font-semibold text-lg">Uplook</Text>
          </View>
          
          <View className="flex-1 items-center justify-center">
            {/* Main Content */}
            <View className="items-center mb-12">
              <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-8 shadow-lg">
                <Ionicons 
                  name="analytics" 
                  size={48} 
                  color="#0d9488" 
                />
              </View>
              
              <Text className="text-3xl font-bold text-blue-900 mb-4 text-center">
                Creating Your Plan
              </Text>
              
              <Text className="text-lg text-blue-700 mb-8 text-center max-w-sm">
                {calculationSteps[currentStep]}
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="w-full mb-8">
              <View className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <View 
                  className="bg-teal-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="text-center text-blue-900 font-medium">
                {progress}% Complete
              </Text>
            </View>

            {/* Continue Button */}
             <View className="w-full">
              <TouchableOpacity
                onPress={handleContinue}
                className={`
                  w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg
                  ${isDone ? 'bg-teal-600' : 'bg-gray-400'} {/* Changed to solid teal-600 when done, darker gray when not */}
                `}
                disabled={!isDone}
              >
                <Text className={`font-semibold text-lg mr-2 ${isDone ? 'text-white' : 'text-gray-700'}`}> {/* Darker gray for disabled text */}
                  {isDone ? 'Continue to Your Plan' : 'Please wait...'}
                </Text>
                {isDone && <Ionicons name="arrow-forward" size={20} color="white" />}
              </TouchableOpacity>
            </View>

            {/* Loading Animation */}
            {!isDone && (
              <View className="mt-8 flex-row space-x-2">
                <View className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                <View className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <View className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}