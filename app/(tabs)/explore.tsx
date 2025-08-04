import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '@clerk/clerk-expo';

type FilterTag = {
  id: string;
  label: string;
  active: boolean;
};

type ActivityCard = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: string;
  author?: string;
};

export default function ExploreScreen() {
  const { user } = useAuth();
  const { user: clerkUser } = useUser();

  // Get personalized filter tags based on user goals
  const getPersonalizedFilterTags = (): FilterTag[] => {
    const defaultTags = [
      { id: '1', label: 'All', active: true },
      { id: '2', label: 'Meditation', active: false },
      { id: '3', label: 'Movement', active: false },
      { id: '4', label: 'Sleep', active: false },
      { id: '5', label: 'Self-confidence', active: false },
      { id: '6', label: 'Work', active: false },
      { id: '7', label: 'Calm', active: false },
      { id: '8', label: 'Gratitude', active: false },
      { id: '9', label: 'Health', active: false },
    ];

    if (user?.goals && user.goals.length > 0) {
      // Add user's goals as active filter tags
      const userGoalTags = user.goals.map((goal, index) => ({
        id: `goal-${index + 1}`,
        label: goal,
        active: true,
      }));

      // Combine user goals with default tags
      return [...userGoalTags, ...defaultTags];
    }

    return defaultTags;
  };

  const [filterTags, setFilterTags] = useState<FilterTag[]>(getPersonalizedFilterTags());

  // Get personalized music cards based on user goals
  const getPersonalizedMusicCards = (): ActivityCard[] => {
    const defaultMusicCards = [
      { id: '1', title: 'Night Time', icon: 'moon' },
      { id: '2', title: 'Sleepy Cat', icon: 'paw' },
      { id: '3', title: 'Sweet Dreams', icon: 'bed' },
      { id: '4', title: 'Nap Time', icon: 'cafe' },
    ];

    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('sleep')) {
        return [
          { id: '1', title: 'Deep Sleep', icon: 'moon' },
          { id: '2', title: 'Relaxation', icon: 'leaf' },
          { id: '3', title: 'Calm Mind', icon: 'heart' },
          { id: '4', title: 'Peaceful Night', icon: 'bed' },
        ];
      } else if (primaryGoal.toLowerCase().includes('meditation')) {
        return [
          { id: '1', title: 'Mindful Sounds', icon: 'leaf' },
          { id: '2', title: 'Zen Music', icon: 'flower' },
          { id: '3', title: 'Breathing', icon: 'heart' },
          { id: '4', title: 'Meditation', icon: 'moon' },
        ];
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return [
          { id: '1', title: 'Workout Mix', icon: 'fitness' },
          { id: '2', title: 'Energy Boost', icon: 'flash' },
          { id: '3', title: 'Motivation', icon: 'star' },
          { id: '4', title: 'Active Life', icon: 'body' },
        ];
      }
    }

    return defaultMusicCards;
  };

  // Get personalized meditation cards
  const getPersonalizedMeditationCards = (): ActivityCard[] => {
    const defaultMeditationCards = [
      { id: '1', title: 'Flow & Focus', image: '/placeholder.svg?height=120&width=160' },
      { id: '2', title: 'Night Routine', image: '/placeholder.svg?height=120&width=160' },
    ];

    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return [
          { id: '1', title: 'Beginner Meditation', image: '/placeholder.svg?height=120&width=160' },
          { id: '2', title: 'Mindfulness Practice', image: '/placeholder.svg?height=120&width=160' },
        ];
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return [
          { id: '1', title: 'Sleep Meditation', image: '/placeholder.svg?height=120&width=160' },
          { id: '2', title: 'Relaxation Session', image: '/placeholder.svg?height=120&width=160' },
        ];
      } else if (primaryGoal.toLowerCase().includes('stress') || primaryGoal.toLowerCase().includes('anxiety')) {
        return [
          { id: '1', title: 'Stress Relief', image: '/placeholder.svg?height=120&width=160' },
          { id: '2', title: 'Anxiety Management', image: '/placeholder.svg?height=120&width=160' },
        ];
      }
    }

    return defaultMeditationCards;
  };

  // Get personalized quiz cards
  const getPersonalizedQuizCards = (): ActivityCard[] => {
    const defaultQuizCards = [
      { id: '1', title: 'Mind Matters', icon: 'moon' },
      { id: '2', title: 'Path to Progress', icon: 'paw' },
      { id: '3', title: 'Wellness Wisdom', icon: 'leaf' },
    ];

    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return [
          { id: '1', title: 'Meditation Level', icon: 'leaf' },
          { id: '2', title: 'Mindfulness Check', icon: 'heart' },
          { id: '3', title: 'Zen Assessment', icon: 'moon' },
        ];
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return [
          { id: '1', title: 'Sleep Quality', icon: 'bed' },
          { id: '2', title: 'Rest Assessment', icon: 'moon' },
          { id: '3', title: 'Sleep Habits', icon: 'time' },
        ];
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return [
          { id: '1', title: 'Fitness Level', icon: 'fitness' },
          { id: '2', title: 'Health Check', icon: 'heart' },
          { id: '3', title: 'Activity Assessment', icon: 'body' },
        ];
      }
    }

    return defaultQuizCards;
  };

  // Get personalized video content
  const getPersonalizedVideoContent = () => {
    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('anxiety') || primaryGoal.toLowerCase().includes('stress')) {
        return {
          title: 'Managing Stress & Anxiety',
          author: 'Wellness Coach',
        };
      } else if (primaryGoal.toLowerCase().includes('meditation')) {
        return {
          title: 'Meditation for Beginners',
          author: 'Mindfulness Expert',
        };
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return {
          title: 'Better Sleep Habits',
          author: 'Sleep Specialist',
        };
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return {
          title: 'Building Healthy Habits',
          author: 'Fitness Coach',
        };
      }
    }
    return {
      title: 'Nurturing Restful Night',
      author: 'Mindful Slumber',
    };
  };

  const musicCards = getPersonalizedMusicCards();
  const meditationCards = getPersonalizedMeditationCards();
  const quizCards = getPersonalizedQuizCards();
  const videoContent = getPersonalizedVideoContent();

  const toggleFilter = (id: string) => {
    setFilterTags(tags => 
      tags.map(tag => 
        tag.id === id ? { ...tag, active: !tag.active } : tag
      )
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 pt-4 pb-8">
          {/* Header */}
          <View className="flex-row items-center justify-center w-full mb-6">
            <Logo size="small" />
            <Text className="ml-2 text-teal-600 font-medium">Uplook</Text>
          </View>
          
          {/* Add daily activity section */}
          <Text className="text-xl font-bold text-blue-900 mb-4">
            {user?.goals && user.goals.length > 0 ? 'Personalized Activities' : 'Add daily activity'}
          </Text>
          
          {/* Filter tags */}
          <View className="flex-row flex-wrap mb-6">
            {filterTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleFilter(tag.id)}
                className={`
                  mr-2 mb-2 px-4 py-2 rounded-full border
                  ${tag.active 
                    ? 'bg-teal-100 border-teal-300' 
                    : 'bg-white border-gray-300'}
                `}
              >
                <Text className={`
                  text-sm font-medium
                  ${tag.active ? 'text-teal-700' : 'text-gray-600'}
                `}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Music section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-blue-900">
                {user?.goals && user.goals.length > 0 ? 'Personalized Music' : 'Music'}
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
            
            <View className="bg-teal-100 rounded-xl p-4">
              <View className="flex-row justify-between">
                {musicCards.map((card) => (
                  <TouchableOpacity key={card.id} className="items-center flex-1">
                    <View className="w-12 h-12 bg-white rounded-lg items-center justify-center mb-2">
                      <Ionicons name={card.icon!} size={24} color="#0d9488" />
                    </View>
                    <Text className="text-xs text-center text-blue-900 font-medium">
                      {card.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          {/* Meditations section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-blue-900">
                {user?.goals && user.goals.length > 0 ? 'Personalized Meditations' : 'Meditations'}
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
            
            <View className="flex-row justify-between">
              {meditationCards.map((card) => (
                <TouchableOpacity key={card.id} className="w-[48%]">
                  <View className="bg-teal-200 rounded-xl p-4 h-32 justify-end">
                    <Text className="text-white font-semibold text-base">
                      {card.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Videos section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-blue-900">
                {user?.goals && user.goals.length > 0 ? 'Recommended Videos' : 'Videos'}
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
            
            <TouchableOpacity className="bg-teal-100 rounded-xl overflow-hidden">
              <View className="h-48 bg-teal-200 items-center justify-center">
                <Ionicons name="play-circle" size={48} color="white" />
              </View>
              <View className="p-4">
                <Text className="text-lg font-semibold text-blue-900 mb-1">
                  {videoContent.title}
                </Text>
                <Text className="text-sm text-blue-700">
                  by {videoContent.author}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Quizzes section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-blue-900">
                {user?.goals && user.goals.length > 0 ? 'Personalized Quizzes' : 'Quizzes'}
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
            
            <View className="flex-row justify-between">
              {quizCards.map((card) => (
                <TouchableOpacity key={card.id} className="w-[30%]">
                  <View className="bg-teal-100 rounded-xl p-4 h-24 items-center justify-center">
                    <View className="w-8 h-8 bg-teal-500 rounded-full items-center justify-center mb-2">
                      <Ionicons name={card.icon!} size={16} color="white" />
                    </View>
                    <Text className="text-xs text-center text-blue-900 font-medium">
                      {card.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}