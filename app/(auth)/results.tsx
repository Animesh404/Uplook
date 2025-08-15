import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity, Platform, StatusBar, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Logo from '../components/Logo';
import { BarChart } from 'react-native-chart-kit';

export default function ResultsScreen() {
  return <ResultsScreenContent />;
}

function ResultsScreenContent() {
  const handleStartToday = async () => {
    try {
      // User data is already saved in AuthContext from onboarding
      // Navigate to the main app with correct route
              router.replace('/(auth)/(tabs)/home' as any);
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

 
  const screenWidth = Dimensions.get('window').width - 56 // padding adjustment

  const chartData = {
    labels: ['Today', '1 Month', '3 Months'],
    datasets: [
      {
        data: [20, 70, 100],
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F0FFFF] edges={['top']}">
      <View className="flex-1 bg-gradient-to-b from-cyan-50 to-teal-100 px-4 pt-8">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-4 pb-8">
            {/* Header */}
            <View className="flex-row items-center justify-center w-full mb-8">
              <Logo size="small" />
              <Text className="text-[#2C3E50] text-[18px] font-medium">Uplook</Text>
            </View>

            {/* Main Content */}
            <View className="bg-[#B7F2F1] rounded-2xl p-6 mb-6 shadow-lg -mx-4">
              <View className="items-center mb-6">
                <Ionicons name="checkmark-circle" size={32} color="#002d62" />
                <Text className="text-2xl font-bold text-blue-900 mb-2 mt-2 text-center">
                  Your Plan is Ready!
                </Text>
                <Text className="text-blue-900 text-center text-lg">
                  Based on your answers, we've created a personalized self-improvement plan
                </Text>
              </View>

              {/* Growth potential chart */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-blue-900 mb-2">
                  Your Growth Journey
                </Text>
                <Text className="text-sm text-blue-900 mb-4">
                  Expected self-esteem improvement over time
                </Text>

                <View style={{ 
                  backgroundColor: '#7DDBD9', 
                  borderRadius: 16, 
                  padding: 20,
                  margin: 2,
                  overflow: 'hidden' // prevent chart from floating outside
                }}>
                  {/* Title */}
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#2C5F5F',
                    textAlign: 'center',
                    marginBottom: 8
                  }}>
                    Your growth potential graph
                  </Text>
                  
                  {/* Subtitle */}
                  <Text style={{
                    fontSize: 14,
                    color: '#2C5F5F',
                    textAlign: 'center',
                    marginBottom: 20
                  }}>
                    Time x Self esteem level
                  </Text>

                  {/* Chart container with axis */}
                  <View style={{ position: 'relative', paddingBottom: 25 }}>
                    <BarChart
                      data={chartData}
                      width={screenWidth - 88} // adjusted width to prevent cutoff
                      height={160}
                      fromZero
                      withHorizontalLabels={false}
                      withVerticalLabels={true}

                      showValuesOnTopOfBars={false}
                      chartConfig={{
                        backgroundGradientFrom: '#7DDBD9',
                        backgroundGradientTo: '#7DDBD9',
                        decimalPlaces: 0,
                        color: () => '#6B46C1',
                        barPercentage: 0.6,
                        propsForBackgroundLines: {
                          stroke: '#FFFFFF',
                          strokeWidth: 1,
                          strokeDasharray: '',
                        },
                        propsForLabels: {
                          fontSize: 11,
                          fill: '#2C5F5F',
                          fontWeight: '500'
                        },
                      }}
                      style={{
                        borderRadius: 8,
                      marginLeft: -10, // align with y-axis
                        // removed margin to align with grid lines
                      }}
                      yAxisLabel=""
                      yAxisSuffix=""
                      
                    />

                    {/* Y-axis line - aligned with white horizontal lines */}
                    <View style={{
                      position: 'absolute',
                      left: -10, // align with where white grid lines start
                      top: 0, // start from top of chart area
                      bottom: 50, // stop at x-axis position
                      width: 2,
                      backgroundColor: '#2C5F5F',
                    }} />

                    {/* X-axis line - aligned with white horizontal lines */}
                    <View style={{
                      position: 'absolute',
                      left: -10, // start from y-axis intersection
                      right: -10, // align with where white grid lines end
                      bottom: 48, // positioned well above x-axis labels
                      height: 2,
                      backgroundColor: '#2C5F5F',
                    }} />
                  </View>
                </View>


              </View>
            </View>

            {/* Personal summary */}
            <View className="bg-[#B7F2F1] rounded-2xl p-6 mb-6 shadow-lg -mx-4">
              <Text className="text-lg font-semibold text-blue-900 mb-4">
                Areas for Growth
              </Text>
              <View className="space-y-3">
                {personalSummaryItems.map((item) => (
                  <View
                    key={item.id}
                    className="flex-row items-center bg-[#DEFAF5] rounded-xl p-3 mb-4"
                  >
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text className="text-sm font-medium text-blue-900 flex-1">{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Your Plan */}
            <View className="bg-[#B7F2F1] rounded-2xl p-6 mb-6 shadow-lg -mx-4">
              <Text className="text-lg font-semibold text-blue-900 mb-4">
                What's Included in Your Plan
              </Text>
              <View className="space-y-3">
                {planItems.map((item) => (
                  <View key={item.id} className="flex-row items-center mb-4">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text className="text-sm font-medium text-blue-900 flex-1">{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Start Button */}
            <View className="bg-[#B7F2F1] rounded-2xl p-6 shadow-lg -mx-4">
              <Text className="text-lg text-blue-900 font-semibold text-center mb-2">
                Ready to Begin Your Journey?
              </Text>
              <Text className="text-blue-900 text-center mb-6">
                Start your personalized wellness plan today
              </Text>
              <TouchableOpacity
                onPress={handleStartToday}
                className="bg-indigo-600 rounded-xl py-4 flex-row items-center justify-center shadow-lg"
              >
                <Text className="text-white font-semibold text-lg mr-2">Start Today</Text>
                <Ionicons name="rocket" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}