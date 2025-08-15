import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, StatusBar, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';
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
  contentType?: 'video' | 'meditation' | 'music' | 'quiz' | 'learning_module';
  videoId?: string; // Add videoId for navigation
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

  // Get personalized music cards using working mock IDs
  const getPersonalizedMusicCards = (): ActivityCard[] => {
    const defaultMusicCards: ActivityCard[] = [
      { id: '3', title: 'Relaxing Music', icon: 'moon' as keyof typeof Ionicons.glyphMap, contentType: 'music' },
      { id: '1', title: 'Morning Sound', icon: 'paw' as keyof typeof Ionicons.glyphMap, contentType: 'meditation' },
      { id: '2', title: 'Reflection', icon: 'bed' as keyof typeof Ionicons.glyphMap, contentType: 'learning_module' },
      { id: 'video-1', title: 'Mindfulness', icon: 'cafe' as keyof typeof Ionicons.glyphMap, contentType: 'video' },
    ];

    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('sleep')) {
        return [
          { id: '3', title: 'Sleep Music', icon: 'moon' as keyof typeof Ionicons.glyphMap, contentType: 'music' },
          { id: '1', title: 'Relaxation', icon: 'leaf' as keyof typeof Ionicons.glyphMap, contentType: 'meditation' },
          { id: '2', title: 'Calm Mind', icon: 'heart' as keyof typeof Ionicons.glyphMap, contentType: 'learning_module' },
          { id: 'video-1', title: 'Mindful Night', icon: 'bed' as keyof typeof Ionicons.glyphMap, contentType: 'video' },
        ];
      } else if (primaryGoal.toLowerCase().includes('meditation')) {
        return [
          { id: '1', title: 'Mindful Sounds', icon: 'leaf' as keyof typeof Ionicons.glyphMap, contentType: 'meditation' },
          { id: '3', title: 'Zen Music', icon: 'flower' as keyof typeof Ionicons.glyphMap, contentType: 'music' },
          { id: '2', title: 'Breathing', icon: 'heart' as keyof typeof Ionicons.glyphMap, contentType: 'learning_module' },
          { id: 'video-1', title: 'Meditation', icon: 'moon' as keyof typeof Ionicons.glyphMap, contentType: 'video' },
        ];
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return [
          { id: 'video-1', title: 'Workout Guide', icon: 'fitness' as keyof typeof Ionicons.glyphMap, contentType: 'video' },
          { id: '3', title: 'Energy Boost', icon: 'flash' as keyof typeof Ionicons.glyphMap, contentType: 'music' },
          { id: '1', title: 'Motivation', icon: 'star' as keyof typeof Ionicons.glyphMap, contentType: 'meditation' },
          { id: '2', title: 'Active Life', icon: 'body' as keyof typeof Ionicons.glyphMap, contentType: 'learning_module' },
        ];
      }
    }

    return defaultMusicCards;
  };

  // Get personalized meditation cards using working mock IDs
  const getPersonalizedMeditationCards = (): ActivityCard[] => {
    const defaultMeditationCards: ActivityCard[] = [
      { id: '1', title: 'Morning Meditation', image: require('../../../assets/images/focus.jpeg'), contentType: 'meditation' as const },
      { id: '2', title: 'Gratitude Journal', image: require('../../../assets/images/night.jpeg'), contentType: 'learning_module' as const },
    ];

    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return [
          { id: '1', title: 'Morning Meditation', image: require('../../../assets/images/meditate.jpeg'), contentType: 'meditation' },
          { id: '2', title: 'Gratitude Journal', image: require('../../../assets/images/gratitude.jpeg'), contentType: 'learning_module' },
        ];
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return [
          { id: '3', title: 'Relaxing Sleep Music', image: require('../../../assets/images/gratitude.jpeg'), contentType: 'music' },
          { id: '1', title: 'Morning Meditation', image: require('../../../assets/images/gratitude.jpeg'), contentType: 'meditation' },
        ];
      } else if (primaryGoal.toLowerCase().includes('stress') || primaryGoal.toLowerCase().includes('anxiety')) {
        return [
          { id: '1', title: 'Morning Meditation', image: require('../../../assets/images/gratitude.jpeg'), contentType: 'meditation' },
          { id: 'video-1', title: 'How to be mindful', image: require('../../../assets/images/gratitude.jpeg'), contentType: 'video' },
        ];
      }
    }

    return defaultMeditationCards;
  };

  // Get personalized quiz cards using working mock IDs  
  const getPersonalizedQuizCards = (): ActivityCard[] => {
    const defaultQuizCards: ActivityCard[] = [
      { id: '1', title: 'Mind Matters', icon: 'moon' as keyof typeof Ionicons.glyphMap, contentType: 'meditation' },
      { id: '2', title: 'Path to Progress', icon: 'paw' as keyof typeof Ionicons.glyphMap, contentType: 'learning_module' },
      { id: '3', title: 'Wellness Wisdom', icon: 'leaf' as keyof typeof Ionicons.glyphMap, contentType: 'music' },
    ];

    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return [
          { id: '1', title: 'Meditation Level', icon: 'leaf', contentType: 'meditation' },
          { id: 'video-1', title: 'Mindfulness Check', icon: 'heart', contentType: 'video' },
          { id: '2', title: 'Zen Assessment', icon: 'moon', contentType: 'learning_module' },
        ];
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return [
          { id: '3', title: 'Sleep Quality', icon: 'bed', contentType: 'music' },
          { id: '1', title: 'Rest Assessment', icon: 'moon', contentType: 'meditation' },
          { id: '2', title: 'Sleep Habits', icon: 'time', contentType: 'learning_module' },
        ];
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return [
          { id: 'video-1', title: 'Fitness Level', icon: 'fitness' as keyof typeof Ionicons.glyphMap, contentType: 'video' },
          { id: '1', title: 'Health Check', icon: 'heart' as keyof typeof Ionicons.glyphMap, contentType: 'meditation' },
          { id: '2', title: 'Activity Assessment', icon: 'body' as keyof typeof Ionicons.glyphMap, contentType: 'learning_module' },
        ];
      }
    }

    return defaultQuizCards;
  };

  // Get personalized video content with fallback to known working IDs
  const getPersonalizedVideoContent = (): ActivityCard => {
    // Use a default content ID that you know exists in your database
    // You should replace this with an ID that actually exists in your API
    const defaultVideoId = '1'; // Change this to a video ID that exists in your database
    
    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('anxiety') || primaryGoal.toLowerCase().includes('stress')) {
        return {
          id: defaultVideoId,
          title: 'Managing Stress & Anxiety',
          author: 'Wellness Coach',
          contentType: 'video',
          videoId: defaultVideoId
        };
      } else if (primaryGoal.toLowerCase().includes('meditation')) {
        return {
          id: defaultVideoId,
          title: 'Meditation for Beginners',
          author: 'Mindfulness Expert',
          contentType: 'video',
          videoId: defaultVideoId
        };
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return {
          id: defaultVideoId,
          title: 'Better Sleep Habits',
          author: 'Sleep Specialist',
          contentType: 'video',
          videoId: defaultVideoId
        };
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return {
          id: defaultVideoId,
          title: 'Building Healthy Habits',
          author: 'Fitness Coach',
          contentType: 'video',
          videoId: defaultVideoId
        };
      }
    }
    return {
      id: defaultVideoId,
      title: 'Nurturing Restful Night',
      author: 'Mindful Slumber',
      contentType: 'video',
      videoId: defaultVideoId
    };
  };

  const musicCards = getPersonalizedMusicCards();
  const meditationCards = getPersonalizedMeditationCards();
  const quizCards = getPersonalizedQuizCards();
  const videoContent = getPersonalizedVideoContent();

  // Handle activity press - similar to HomeScreen with error handling
  const handleActivityPress = async (item: ActivityCard) => {
    try {
      console.log(`🎯 User pressed: ${item.title} (${item.contentType})`);
      
      // Navigate to content based on type
      if (item.contentType === 'video') {
        console.log(`🎬 Navigating to video content/${item.id}`);
        
        // For explore content, we might want to handle missing content gracefully
        // You could add a check here to verify content exists before navigating
        router.push(`/content/${item.id}`);
        
      } else if (item.contentType === 'meditation') {
        console.log(`🧘 Navigating to meditation content/${item.id}`);
        router.push(`/content/${item.id}`);
      } else if (item.contentType === 'music') {
        console.log(`🎵 Navigating to music content/${item.id}`);
        router.push(`/content/${item.id}`);
      } else if (item.contentType === 'quiz') {
        console.log(`📝 Navigating to quiz content/${item.id}`);
        router.push(`/content/${item.id}`);
      } else {
        console.log(`✅ Default navigation for ${item.contentType}`);
        router.push(`/content/${item.id}`);
      }
    } catch (error) {
      console.error('Failed to handle activity:', error);
      // Optionally show an alert or toast to the user
      // Alert.alert('Error', 'Unable to load content. Please try again later.');
    }
  };

  const toggleFilter = (id: string) => {
    setFilterTags(tags => 
      tags.map(tag => 
        tag.id === id ? { ...tag, active: !tag.active } : tag
      )
    );
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView className="flex-1 bg-[#f0ffff]" style={{  paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16   }}>
      <ScrollView className="flex-1">
        <View className="px-6 pb-8" >
          {/* Header */}
          <View className="flex-row items-center justify-center w-full mb-8">
              <Logo size="small" />
              <Text className="text-[#2C3E50] text-[18px] font-medium">Uplook</Text>
          </View>
          
          {/* Add daily activity section */}
          <Text className="text-xl font-bold text-blue-900 mb-4 ">
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
                    ? 'bg-[#88d2f2] ' 
                    : 'bg-[#f0ffff] border-[#002d62]'}
                `}
              >
                <Text className={`
                  text-sm font-medium
                  ${tag.active ? 'text-blue-900' : 'text-blue-700'}
                `}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Music section */}
          <View className="mb-6  bg-[#60e2e2] rounded-xl p-4">
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
            
            <View className="flex-row justify-between">
              {musicCards.map((card) => (
                <TouchableOpacity key={card.id} className="items-center flex-1" onPress={() => handleActivityPress(card)}>
                  <View className="w-12 h-12 bg-[#b7f2f1] rounded-lg items-center justify-center mb-2">
                    <Ionicons name={card.icon!} size={24} color="#4b42b6" />
                  </View>
                  <Text className="text-xs text-center text-blue-900 font-medium">
                    {card.title}
                  </Text>
                </TouchableOpacity>
              ))}
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
                <TouchableOpacity key={card.id} className="w-[48%]" onPress={() => handleActivityPress(card)}>
                  <View style={{
                    height: 128,
                    borderRadius: 16,
                    overflow: 'hidden',
                  }}>
                    <ImageBackground
                      source={typeof card.image === 'string' ? { uri: card.image } : card.image}
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 12,
                      }}
                      imageStyle={{ borderRadius: 16 }}
                    >
                      {/* Blue overlay - same as home screen */}
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(42, 191, 234, 0.7)', // Same blue overlay as home screen
                        }}
                      />
                      {/* Centered text content */}
                      <View style={{ zIndex: 1, alignItems: 'center' }}>
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: 16,
                            textAlign: "center",
                            textShadowColor: 'rgba(0, 0, 0, 0.5)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                          }}
                          numberOfLines={2}
                        >
                          {card.title}
                        </Text>
                      </View>
                    </ImageBackground>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Videos section - Now clickable */}
          <View className="mb-6 bg-[#60e2e2] rounded-xl p-4">
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
            
            <TouchableOpacity className="bg-[#60e2e2] rounded-xl overflow-hidden" onPress={() => handleActivityPress(videoContent)}>
              <View className="relative h-48">
                {/* Background Image - you can add a specific video thumbnail image here */}
                <Image
                  source={require('../../../assets/images/gratitude.jpeg')} // or use a video thumbnail
                  style={{ 
                    width: '100%',
                    height: '100%'
                  }}
                  resizeMode="cover"
                />
                {/* Overlay */}
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(42, 191, 234, 0.7)',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Ionicons name="play-circle" size={64} color="#b7f2f1" />
                </View>
              </View>
              <View className="p-4 bg-[#60e2e2]">
                <Text className="text-lg font-semibold text-indigo mb-1">
                  {videoContent.title}
                </Text>
                <Text className="text-sm text-indigo">
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
                <TouchableOpacity key={card.id} className="w-[30%]" onPress={() => handleActivityPress(card)}>
                  <View className="bg-[#60e2e2] m-2 rounded-xl h-24 items-center justify-center">
                  <Ionicons name={card.icon!} size={32} color="#4b42b6" />
                  </View>
                  <Text className="text-s text-center text-blue-900 font-medium">
                      {card.title}
                    </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}