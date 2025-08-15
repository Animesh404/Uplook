import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '@clerk/clerk-expo';

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export default function LibraryScreen() {
  const { user } = useAuth();
  const { user: clerkUser } = useUser();
  
  // Get personalized checklist items based on user goals
  const getPersonalizedChecklist = (): ChecklistItem[] => {
    const defaultItems = [
      { id: '1', label: 'Think good thoughts of yourself', completed: true },
      { id: '2', label: 'Stretch your body', completed: true },
      { id: '3', label: 'Have a meditation', completed: false },
      { id: '4', label: 'Daily journaling', completed: false },
    ];

    if (user?.goals && user.goals.length > 0) {
      const personalizedItems = user.goals.map((goal, index) => ({
        id: `goal-${index + 1}`,
        label: `Work on: ${goal}`,
        completed: false,
      }));

      // Combine personalized goals with default items
      return [...personalizedItems.slice(0, 2), ...defaultItems.slice(0, 2)];
    }

    return defaultItems;
  };

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(getPersonalizedChecklist());

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Get personalized learning module title
  const getLearningModuleTitle = () => {
    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return 'Mindfulness & Meditation';
      } else if (primaryGoal.toLowerCase().includes('exercise') || primaryGoal.toLowerCase().includes('fitness')) {
        return 'Movement & Wellness';
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return 'Sleep & Recovery';
      } else if (primaryGoal.toLowerCase().includes('stress') || primaryGoal.toLowerCase().includes('anxiety')) {
        return 'Stress Management';
      }
    }
    return 'How to be mindful';
  };

  // Get personalized suggested activities
  const getSuggestedActivities = () => {
    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return [
          { title: 'Meditation video', icon: 'play-circle' },
          { title: 'Breathing exercise', icon: 'leaf' },
        ];
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return [
          { title: 'Quick workout', icon: 'fitness' },
          { title: 'Stretching routine', icon: 'body' },
        ];
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return [
          { title: 'Sleep meditation', icon: 'moon' },
          { title: 'Relaxation music', icon: 'musical-notes' },
        ];
      }
    }
    return [
      { title: 'Meditation video', icon: 'play-circle' },
      { title: 'Take a break from social media', icon: 'phone-portrait' },
    ];
  };

  // Get personalized video coach content
  const getVideoCoachContent = () => {
    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('anxiety') || primaryGoal.toLowerCase().includes('stress')) {
        return 'How to cope with anxiety';
      } else if (primaryGoal.toLowerCase().includes('meditation')) {
        return 'Beginner meditation guide';
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return 'Sleep hygiene tips';
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return 'Building healthy habits';
      }
    }
    return 'How to cope with anxiety';
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView className="flex-1 bg-white" style={{  paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16   }}>
      <ScrollView className="flex-1">
        <View className="px-6 pt-4 pb-8" >
          {/* Header */}
          <View className="flex-row items-center justify-center w-full mb-6">
            <Logo size="small" />
            <Text className="ml-2 text-teal-600 font-medium">Uplook</Text>
          </View>
          
          {/* Learning module header */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-blue-900 mb-1">
              {getLearningModuleTitle()}
            </Text>
            <Text className="text-sm text-blue-700">
              Learning module
            </Text>
          </View>
          
          {/* On presence section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-blue-900">On presence</Text>
              <View className="flex-row">
                <TouchableOpacity className="p-1">
                  <Ionicons name="chevron-back" size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity className="p-1">
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="bg-teal-200 rounded-xl p-6">
              <View className="flex-row items-start mb-3">
                <View className="w-3 h-3 bg-teal-600 rounded-full mt-1 mr-3" />
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-blue-900 mb-2">
                    Pay attention to the present moment
                  </Text>
                  <Text className="text-sm text-blue-800">
                    Cultivate awareness of your thoughts, emotions, and sensations as they arise in the here and now.
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Suggested activities section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-blue-900">
                {user?.goals && user.goals.length > 0 ? 'Personalized Activities' : 'Suggested activities'}
              </Text>
              <View className="flex-row">
                <TouchableOpacity className="p-1">
                  <Ionicons name="chevron-back" size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity className="p-1">
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View className="flex-row justify-between mb-4">
              {getSuggestedActivities().map((activity, index) => (
                <TouchableOpacity key={index} className="w-[48%]">
                  <View className="bg-teal-100 rounded-xl h-32 items-center justify-center relative">
                    <Ionicons name={activity.icon as any} size={32} color="white" />
                    <View className="absolute bottom-3 left-3 right-3">
                      <Text className="text-white text-xs font-medium">
                        {activity.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Quick mindfulness check */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-blue-900 mb-4">
              {user?.goals && user.goals.length > 0 ? 'Your Daily Progress' : 'Quick mindfulness check'}
            </Text>
            
            <View className="bg-teal-100 rounded-xl p-4">
              {checklistItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleChecklistItem(item.id)}
                  className="flex-row items-center mb-3 last:mb-0"
                >
                  <View className={`
                    w-5 h-5 rounded border mr-3 items-center justify-center
                    ${item.completed 
                      ? 'bg-teal-500 border-teal-500' 
                      : 'bg-white border-gray-300'}
                  `}>
                    {item.completed && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text className={`
                    flex-1 text-sm
                    ${item.completed 
                      ? 'text-teal-700 line-through' 
                      : 'text-blue-900'}
                  `}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Video coach section */}
          <View className="mb-6">
            <TouchableOpacity className="bg-teal-300 rounded-xl p-6 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xs text-teal-800 mb-1">Video coach</Text>
                <Text className="text-lg font-semibold text-white">
                  {getVideoCoachContent()}
                </Text>
              </View>
              <View className="w-12 h-12 bg-white bg-opacity-20 rounded-full items-center justify-center">
                <Ionicons name="play" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}