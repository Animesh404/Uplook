import React, { useMemo } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthGuard } from './components/AuthGuard';
import { useOnboarding } from './contexts/OnboardingContext';

export default function ResultsScreen() {
  return (
    <AuthGuard requireOnboarding={false}>
      <ResultsScreenContent />
    </AuthGuard>
  );
}

function ResultsScreenContent() {
  const { data } = useOnboarding();

  // Derive a simple, explainable growth projection from onboarding data
  const growth = useMemo(() => {
    const goalsCount = (data.goals || []).length;
    const reminders = (data.reminderTimes || []).length;

    // Base today score reflects current self-view (more goals selected => lower starting score)
    const today = Math.max(10, 50 - goalsCount * 5);

    // Consistency and focus increase growth
    const monthBoost = reminders * 6 + goalsCount * 4 + 10; // base improvement
    const oneMonth = Math.min(100, today + monthBoost);

    // Continued consistency compounds growth
    const threeMonths = Math.min(100, oneMonth + (reminders * 8 + goalsCount * 6 + 10));

    return { today, oneMonth, threeMonths };
  }, [data.goals, data.reminderTimes]);

  // Map goals to personal summary talking points (kept short and positive)
  const personalSummaryItems = useMemo(() => {
    const items: { id: string; label: string; icon: string; color: string }[] = [];
    const goals = (data.goals || []).map(g => g.toLowerCase());

    if (goals.includes('self-confidence')) {
      items.push(
        { id: 'ps1', label: 'Lack of self‑trust', icon: 'shield', color: '#dc2626' },
        { id: 'ps2', label: 'Comparing to others', icon: 'git-compare', color: '#ca8a04' },
      );
    }
    if (goals.includes('stress management')) {
      items.push(
        { id: 'ps3', label: 'Fear of rejection', icon: 'people', color: '#ea580c' },
        { id: 'ps4', label: 'Strong inner‑critique', icon: 'alert-circle', color: '#d97706' },
      );
    }
    if (goals.includes('sleep')) {
      items.push({ id: 'ps5', label: 'Irregular wind‑down routine', icon: 'moon', color: '#0ea5e9' });
    }
    if (items.length === 0) {
      items.push(
        { id: 'ps6', label: 'Building consistent habits', icon: 'sparkles', color: '#0284c7' },
        { id: 'ps7', label: 'Staying kind to yourself', icon: 'heart', color: '#ef4444' },
      );
    }
    return items.slice(0, 4);
  }, [data.goals]);

  // Build a plan from goals + reminders
  const planItems = useMemo(() => {
    const goals = (data.goals || []).map(g => g.toLowerCase());
    const items: { id: string; label: string; icon: string; color: string }[] = [];

    items.push({ id: 'plan1', label: 'Learning modules for improvement', icon: 'book', color: '#0d9488' });
    if (goals.includes('meditation') || goals.includes('stress management')) {
      items.push({ id: 'plan2', label: 'Daily meditations', icon: 'leaf', color: '#0891b2' });
    }
    items.push({ id: 'plan3', label: 'Daily reflection quizzes and journal', icon: 'create', color: '#0ea5e9' });
    if (goals.includes('self-confidence') || goals.includes('meditation')) {
      items.push({ id: 'plan4', label: 'Video coach lessons', icon: 'videocam', color: '#0284c7' });
    }
    if (goals.includes('sleep')) {
      items.push({ id: 'plan5', label: 'Spoken word and music for your mind improvement', icon: 'musical-notes', color: '#0369a1' });
    }
    items.push({ id: 'plan6', label: 'Customer support', icon: 'chatbubble-ellipses', color: '#075985' });

    return items;
  }, [data.goals]);
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

  // Helper to scale bar heights (container height: 128 per design)
  const barHeight = (value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    return (clamped / 100) * 128;
  };

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
                  Based on your answers, we
                </Text>
                <Text className="text-blue-700 text-center text-lg">
                  prepared a self‑improvement plan for you
                </Text>
              </View>
              
              {/* Growth potential graph */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-blue-900 mb-2">
                  Your growth potential graph
                </Text>
                <Text className="text-sm text-blue-700 mb-4">
                  Time × Self esteem level
                </Text>
                
                <View style={{ height: 128, backgroundColor: '#e6f7f7', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#d0f0ef' }}>
                  {/* grid lines */}
                  <View style={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
                    {[0,1,2,3].map(i => (
                      <View key={i} style={{ height: 1, backgroundColor: '#d9f0f0', marginBottom: 24 }} />
                    ))}
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ width: 20, height: barHeight(growth.today), backgroundColor: '#0d9488', borderRadius: 6, marginBottom: 8 }} />
                      <Text className="text-xs text-blue-900 font-medium">Today</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ width: 20, height: barHeight(growth.oneMonth), backgroundColor: '#0d9488', borderRadius: 6, marginBottom: 8 }} />
                      <Text className="text-xs text-blue-900 font-medium">1 month</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ width: 20, height: barHeight(growth.threeMonths), backgroundColor: '#0d9488', borderRadius: 6, marginBottom: 8 }} />
                      <Text className="text-xs text-blue-900 font-medium">3 months</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Personal summary */}
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
              <Text className="text-lg font-semibold text-blue-900 mb-4">Your personal summary</Text>
              
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
              <Text className="text-lg font-semibold text-blue-900 mb-4">Your plan includes</Text>
              
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
              
              <TouchableOpacity onPress={handleStartToday} className="bg-indigo-600 rounded-2xl py-4 flex-row items-center justify-center">
                <Text className="text-white font-semibold text-lg mr-2">Start today</Text>
                <Ionicons name="rocket" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}