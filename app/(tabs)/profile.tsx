import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Alert, ScrollView, Platform, StatusBar } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { apiService } from '../services/api';

type StreakInfo = {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_percentage: number;
};

type Badge = {
  id: number;
  name: string;
  description: string;
  badge_type: string;
  icon_url?: string;
  earned_at: string;
  is_completed: boolean;
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreakAndBadges();
  }, []);

  const fetchStreakAndBadges = async () => {
    try {
      console.log('Fetching streak and badge data...');
      
      // Fetch data (API service will handle fallbacks automatically)
      const [streakData, badgeData] = await Promise.all([
        apiService.getStreakInfo(),
        apiService.getUserBadges()
      ]);
      
      console.log('Successfully fetched data:', { streakData, badgeData });
      setStreakInfo(streakData);
      setBadges(badgeData);
      
    } catch (error) {
      console.error('Error fetching streak and badges:', error);
      
      // Set default empty state as fallback
      setStreakInfo({
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        streak_percentage: 0
      });
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'weekly_streak':
        return 'calendar';
      case 'monthly_streak':
        return 'trophy';
      case 'yearly_streak':
        return 'star';
      case 'meditation_master':
        return 'leaf';
      case 'fitness_champion':
        return 'fitness';
      case 'sleep_expert':
        return 'moon';
      case 'stress_warrior':
        return 'heart';
      case 'first_activity':
        return 'checkmark-circle';
      case 'morning_routine':
        return 'sunny';
      default:
        return 'medal';
    }
  };

  const getStreakMessage = () => {
    if (!streakInfo) return '';
    
    if (streakInfo.current_streak === 0) {
      return 'Start your wellness journey today!';
    } else if (streakInfo.current_streak < 7) {
      return `${7 - streakInfo.current_streak} more days to your first weekly badge!`;
    } else if (streakInfo.current_streak < 30) {
      return `${30 - streakInfo.current_streak} more days to monthly badge!`;
    } else {
      return 'Amazing streak! Keep it up!';
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView className="flex-1 " style={{backgroundColor: "#f0ffff", paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16 }}>
      <ScrollView className="flex-1">
        <View className="flex-1 px-6 pt-4 pb-8" >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-blue-900 mb-2">
              Profile
            </Text>
            <Text className="text-blue-900">
              Manage your account and track your progress
            </Text>
          </View>

          {/* Connection Status */}
          {loading && (
            <View className="bg-white rounded-xl p-6 mb-6">
              <Text className="text-center text-blue-900">Loading streak data...</Text>
            </View>
          )}

          {/* Streak Progress */}
          {streakInfo && (
            <View className="bg-white rounded-xl p-6 mb-6">
              <Text className="text-xl font-semibold text-blue-900 mb-4">
                Your Streak
              </Text>
              
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-3xl font-bold text-teal-600">
                    {streakInfo.current_streak}
                  </Text>
                  <Text className="text-sm text-gray-600">Current Streak</Text>
                </View>
                
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-blue-900">
                    {streakInfo.longest_streak}
                  </Text>
                  <Text className="text-sm text-gray-600">Best Streak</Text>
                </View>
                
                <View className="flex-1 items-end">
                  <Ionicons name="flame" size={40} color="#f59e0b" />
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-600">Weekly Progress</Text>
                  <Text className="text-sm text-teal-600 font-medium">
                    {Math.round(streakInfo.streak_percentage)}%
                  </Text>
                </View>
                <View className="w-full bg-gray-200 rounded-full h-3">
                  <View 
                    className="bg-teal-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${streakInfo.streak_percentage}%` }}
                  />
                </View>
              </View>

              <Text className="text-sm text-gray-600 text-center">
                {getStreakMessage()}
              </Text>
            </View>
          )}

          {/* Badges */}
          <View className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-xl font-semibold text-blue-900 mb-4">
              Your Badges
            </Text>
            
            {badges.length > 0 ? (
              <View className="flex-row flex-wrap">
                {badges.map((badge) => (
                  <View key={badge.id} className="w-1/3 items-center mb-4">
                    <View className={`
                      w-16 h-16 rounded-full items-center justify-center mb-2
                      ${badge.is_completed ? 'bg-yellow-100' : 'bg-gray-100'}
                    `}>
                      <Ionicons 
                        name={getBadgeIcon(badge.badge_type) as any} 
                        size={24} 
                        color={badge.is_completed ? '#f59e0b' : '#9ca3af'} 
                      />
                    </View>
                    <Text className={`
                      text-xs text-center font-medium
                      ${badge.is_completed ? 'text-yellow-600' : 'text-gray-500'}
                    `}>
                      {badge.name}
                    </Text>
                    {!badge.is_completed && (
                      <Text className="text-xs text-gray-400 text-center mt-1">
                        In Progress
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 text-center py-4">
                Complete activities to earn badges!
              </Text>
            )}
          </View>

          {/* User Info */}
          <View className="bg-white rounded-xl p-6 mb-6">
            <Text className="text-xl font-semibold text-blue-900 mb-4">
              Personal Information
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row items-center">
                <Ionicons name="person" size={20} color="#0d9488" />
                <Text className="text-blue-900 ml-3 flex-1">
                  {user?.fullName || clerkUser?.fullName || 'Not provided'}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="mail" size={20} color="#0d9488" />
                <Text className="text-blue-900 ml-3 flex-1">
                  {user?.email || clerkUser?.primaryEmailAddress?.emailAddress || 'Not provided'}
                </Text>
              </View>
              
              {user?.age && (
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={20} color="#0d9488" />
                  <Text className="text-blue-900 ml-3 flex-1">
                    Age: {user.age}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Goals */}
          {user?.goals && user.goals.length > 0 && (
            <View className="bg-white rounded-xl p-6 mb-6">
              <Text className="text-xl font-semibold text-blue-900 mb-4">
                Your Goals
              </Text>
              <View className="space-y-2">
                {user.goals.map((goal, index) => (
                  <View key={index} className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#0d9488" />
                    <Text className="text-blue-900 ml-2">{goal}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reminder Times */}
          {user?.reminderTimes && user.reminderTimes.length > 0 && (
            <View className="bg-white rounded-xl p-6 mb-6">
              <Text className="text-xl font-semibold text-blue-900 mb-4">
                Reminder Times
              </Text>
              <View className="space-y-2">
                {user.reminderTimes.map((time, index) => (
                  <View key={index} className="flex-row items-center">
                    <Ionicons name="time" size={16} color="#0d9488" />
                    <Text className="text-blue-900 ml-2">{time}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Admin Button - Show only for admin or super_admin users */}
          {user && ((user as any).role === 'admin' || (user as any).role === 'super_admin') && (
            <TouchableOpacity
              onPress={() => router.push('/admin')}
              className="bg-purple-500 rounded-lg p-4 flex-row items-center justify-center mb-4"
            >
              <Ionicons name="settings" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Admin Panel</Text>
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-lg p-4 flex-row items-center justify-center"
          >
            <Ionicons name="log-out" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
