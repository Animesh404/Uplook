import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthGuard } from './components/AuthGuard';

export default function ResultsScreen() {
  return <ResultsScreenContent />;
}

function ResultsScreenContent() {
  const handleStartToday = async () => {
    try {
      // User data is already saved in AuthContext from onboarding
      // Navigate to the main app with correct route
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to start. Please try again.');
      console.error('Start error:', error);
    }
  };

  const planItems = [
    { id: '1', label: 'Learning modules for improvement', icon: 'book', color: '#0d9488' },
    { id: '2', label: 'Daily meditations', icon: 'leaf', color: '#0891b2' },
    { id: '3', label: 'Daily reflection quizzes and journal', icon: 'create', color: '#0ea5e9' },
    { id: '4', label: 'Video coach lessons', icon: 'videocam', color: '#0284c7' },
    { id: '5', label: 'Spoken word and music for your mind improvement', icon: 'musical-notes', color: '#0369a1' },
    { id: '6', label: 'Customer support', icon: 'chatbubble-ellipses', color: '#075985' },
  ];

  const personalSummaryItems = [
    { id: '1', label: 'Lack of self-trust', icon: 'shield', color: '#dc2626' },
    { id: '2', label: 'Fear of rejection', icon: 'people', color: '#ea580c' },
    { id: '3', label: 'Being too critical', icon: 'alert-circle', color: '#d97706' },
    { id: '4', label: 'Comparing to others', icon: 'git-compare', color: '#ca8a04' },
  ];

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView className="flex-1 bg-cyan-50">
      <View className="flex-1 bg-gradient-to-b from-cyan-50 to-teal-100" style={{ paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-4 pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-center w-full mb-8">
              <Image 
                source={require('../assets/images/logo.png')} 
                className="w-8 h-8"
                resizeMode="contain"
              />
              <Text className="ml-2 text-teal-600 font-semibold text-lg">Uplook</Text>
            </View>
            
            {/* Main Content */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-teal-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle" size={32} color="#0d9488" />
                </View>
                <Text className="text-2xl font-bold text-blue-900 mb-2 text-center">
                  Your Plan is Ready!
                </Text>
                <Text className="text-blue-700 text-center text-lg">
                  Based on your answers, we've created a personalized self-improvement plan
                </Text>
              </View>
              
              {/* Growth potential graph */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-blue-900 mb-2">
                  Your Growth Journey
                </Text>
                <Text className="text-sm text-blue-700 mb-4">
                  Expected self-esteem improvement over time
                </Text>
                
                <View className="flex-row justify-between items-end h-32 bg-gradient-to-b from-teal-50 to-teal-100 rounded-xl p-4">
                  <View className="items-center">
                    <View className="w-8 bg-gradient-to-t from-teal-500 to-teal-600 h-8 mb-2 rounded" />
                    <Text className="text-xs text-blue-900 font-medium">Today</Text>
                  </View>
                  <View className="items-center">
                    <View className="w-8 bg-gradient-to-t from-teal-500 to-teal-600 h-20 mb-2 rounded" />
                    <Text className="text-xs text-blue-900 font-medium">1 month</Text>
                  </View>
                  <View className="items-center">
                    <View className="w-8 bg-gradient-to-t from-teal-500 to-teal-600 h-28 mb-2 rounded" />
                    <Text className="text-xs text-blue-900 font-medium">2 months</Text>
                  </View>
                  <View className="items-center">
                    <View className="w-8 bg-gradient-to-t from-teal-500 to-teal-600 h-32 mb-2 rounded" />
                    <Text className="text-xs text-blue-900 font-medium">3 months</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Personal summary */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <Text className="text-lg font-semibold text-blue-900 mb-4">
                Areas for Growth
              </Text>
              
              <View className="space-y-3">
                {personalSummaryItems.map((item) => (
                  <View key={item.id} className="flex-row items-center bg-gray-50 rounded-xl p-3 mb-4">
                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${item.color}20` }}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text className="text-sm font-medium text-blue-900 flex-1">
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Your Plan */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <Text className="text-lg font-semibold text-blue-900 mb-4">
                What's Included in Your Plan
              </Text>
              
              <View className="space-y-3">
                {planItems.map((item) => (
                  <View key={item.id} className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${item.color}20` }}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text className="text-sm font-medium text-blue-900 flex-1">
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Start Button */}
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <Text className="text-lg text-blue-900 font-semibold text-center mb-2">
                Ready to Begin Your Journey?
              </Text>
              <Text className="text-blue-900 text-center mb-6">
                Start your personalized wellness plan today
              </Text>
              
              <TouchableOpacity
                onPress={handleStartToday}
                className="bg-white rounded-xl py-4 flex-row items-center justify-center shadow-lg"
              >
                <Text className="text-teal-600 font-semibold text-lg mr-2">
                  Start Today
                </Text>
                <Ionicons name="rocket" size={20} color="#0d9488" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}