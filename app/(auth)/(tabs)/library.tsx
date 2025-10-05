import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Logo from '../../components/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '@clerk/clerk-expo';

type ChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

type ActivityItem = {
  id: string;
  title: string;
  icon: string;
  contentType: 'video' | 'meditation' | 'music' | 'learning_module';
  image?: any; // Add image property for background images
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

  // Get personalized suggested activities with navigation data
  const getSuggestedActivities = (): ActivityItem[] => {
    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return [
          { 
            id: '1', 
            title: 'Meditation video', 
            icon: 'play-circle', 
            contentType: 'video',
            image: require('../../../assets/images/meditate.jpeg')
          },
          { 
            id: '2', 
            title: 'Breathing exercise', 
            icon: 'leaf', 
            contentType: 'meditation',
            image: require('../../../assets/images/focus.jpeg')
          },
        ];
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return [
          { 
            id: 'video-1', 
            title: 'Quick workout', 
            icon: 'fitness', 
            contentType: 'video',
            image: require('../../../assets/images/gratitude.jpeg')
          },
          { 
            id: '3', 
            title: 'Stretching routine', 
            icon: 'body', 
            contentType: 'meditation',
            image: require('../../../assets/images/night.jpeg')
          },
        ];
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return [
          { 
            id: '1', 
            title: 'Sleep meditation', 
            icon: 'moon', 
            contentType: 'meditation',
            image: require('../../../assets/images/night.jpeg')
          },
          { 
            id: '3', 
            title: 'Relaxation music', 
            icon: 'musical-notes', 
            contentType: 'music',
            image: require('../../../assets/images/focus.jpeg')
          },
        ];
      }
    }
    return [
      { 
        id: '1', 
        title: 'Meditation video', 
        icon: 'play-circle', 
        contentType: 'video',
        image: require('../../../assets/images/meditate.jpeg')
      },
      { 
        id: '2', 
        title: 'Take a break from social media', 
        icon: 'phone-portrait', 
        contentType: 'learning_module',
        image: require('../../../assets/images/gratitude.jpeg')
      },
    ];
  };

  // Get personalized video coach content with navigation data
  const getVideoCoachContent = () => {
    const defaultVideoId = '1'; // Use a default content ID that exists in your database
    
    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('anxiety') || primaryGoal.toLowerCase().includes('stress')) {
        return {
          id: defaultVideoId,
          title: 'How to cope with anxiety',
          contentType: 'video' as const,
          image: require('../../../assets/images/focus.jpeg')
        };
      } else if (primaryGoal.toLowerCase().includes('meditation')) {
        return {
          id: defaultVideoId,
          title: 'Beginner meditation guide',
          contentType: 'video' as const,
          image: require('../../../assets/images/meditate.jpeg')
        };
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return {
          id: defaultVideoId,
          title: 'Sleep hygiene tips',
          contentType: 'video' as const,
          image: require('../../../assets/images/night.jpeg')
        };
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return {
          id: defaultVideoId,
          title: 'Building healthy habits',
          contentType: 'video' as const,
          image: require('../../../assets/images/gratitude.jpeg')
        };
      }
    }
    return {
      id: defaultVideoId,
      title: 'How to cope with anxiety',
      contentType: 'video' as const,
      image: require('../../../assets/images/focus.jpeg')
    };
  };

  // Handle activity press - similar to ExploreScreen
  const handleActivityPress = async (item: ActivityItem) => {
    try {
      console.log(`🎯 User pressed: ${item.title} (${item.contentType})`);
      
      // Navigate to content based on type
      if (item.contentType === 'video') {
        console.log(`🎬 Navigating to video content/${item.id}`);
        router.push(`/content/${item.id}`);
      } else if (item.contentType === 'meditation') {
        console.log(`🧘 Navigating to meditation content/${item.id}`);
        router.push(`/content/${item.id}`);
      } else if (item.contentType === 'music') {
        console.log(`🎵 Navigating to music content/${item.id}`);
        router.push(`/content/${item.id}`);
      } else if (item.contentType === 'learning_module') {
        console.log(`📚 Navigating to learning module content/${item.id}`);
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

  // Handle video coach press
  const handleVideoCoachPress = async () => {
    try {
      const videoCoachContent = getVideoCoachContent();
      console.log(`🎯 User pressed video coach: ${videoCoachContent.title}`);
      router.push(`/content/${videoCoachContent.id}`);
    } catch (error) {
      console.error('Failed to handle video coach:', error);
    }
  };

  // Get content type color - using consistent blue overlay like HomeScreen
  const getContentTypeColor = (contentType: string): string => {
    return 'rgba(42, 191, 234, 0.7)';
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const suggestedActivities = getSuggestedActivities();
  const videoCoachContent = getVideoCoachContent();

  return (
    <SafeAreaView className="flex-1 bg-[#f0ffff]" style={{  paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16   }}>
      <ScrollView className="flex-1">
        <View className="px-6 pb-8" >
          {/* Header - Match explore screen style */}
          <View className="flex-row items-center justify-center w-full mb-8">
            <Logo size="small" />
            <Text className="text-[#2C3E50] text-[18px] font-medium">Uplook</Text>
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
          
          {/* On presence section - Enhanced styling */}
          <View className="mb-6 bg-[#60e2e2] rounded-xl p-4">
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
            
            <View className="bg-[#b7f2f1] rounded-xl p-6">
              <View className="flex-row items-start mb-3">
                <View className="w-3 h-3 bg-[#4b42b6] rounded-full mt-1 mr-3" />
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
          
          {/* Suggested activities section - Enhanced styling with consistent overlay */}
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
              {suggestedActivities.map((activity, index) => (
                <TouchableOpacity key={index} className="w-[48%]" onPress={() => handleActivityPress(activity)}>
                  <View style={{
                    height: 128,
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}>
                    <ImageBackground
                      source={activity.image}
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 12,
                      }}
                      imageStyle={{ borderRadius: 12 }}
                    >
                      {/* Consistent blue overlay - same as HomeScreen */}
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: getContentTypeColor(activity.contentType),
                        }}
                      />
                      {/* Content */}
                      <View style={{ zIndex: 1, alignItems: 'center' }}>
                        <Ionicons name={activity.icon as any} size={32} color="white" />
                        {/* Bottom text */}
                        <View style={{ 
                          position: 'absolute', 
                          bottom: -50, 
                          left: -50, 
                          right: -50,
                        }}>
                          <Text
                            style={{
                              color: "white",
                              fontSize: 12,
                              fontWeight: "500",
                              textAlign: "center",
                              textShadowColor: 'rgba(0, 0, 0, 0.5)',
                              textShadowOffset: { width: 0, height: 1 },
                              textShadowRadius: 2,
                            }}
                            numberOfLines={2}
                          >
                            {activity.title}
                          </Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Quick mindfulness check - Enhanced styling */}
          <View className="mb-6 bg-[#60e2e2] rounded-xl p-4">
            <Text className="text-lg font-semibold text-blue-900 mb-4">
              {user?.goals && user.goals.length > 0 ? 'Your Daily Progress' : 'Quick mindfulness check'}
            </Text>
            
            <View className="bg-[#b7f2f1] rounded-xl p-4">
              {checklistItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleChecklistItem(item.id)}
                  className="flex-row items-center mb-3 last:mb-0"
                >
                  <View className={`
                    w-5 h-5 rounded border mr-3 items-center justify-center
                    ${item.completed 
                      ? 'bg-[#4b42b6] border-[#4b42b6]' 
                      : 'bg-white border-gray-300'}
                  `}>
                    {item.completed && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                  <Text className={`
                    flex-1 text-sm
                    ${item.completed 
                      ? 'text-[#4b42b6] line-through' 
                      : 'text-blue-900'}
                  `}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Video coach section - Enhanced styling with consistent overlay */}
          <View className="mb-6">
            <TouchableOpacity className="bg-[#60e2e2] rounded-xl overflow-hidden" onPress={handleVideoCoachPress}>
              <View className="relative h-48">
                {/* Background Image with consistent overlay */}
                <ImageBackground
                  source={videoCoachContent.image}
                  style={{ 
                    width: '100%',
                    height: '100%'
                  }}
                  imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                  resizeMode="cover"
                >
                  {/* Consistent blue overlay - same as HomeScreen */}
                  <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: getContentTypeColor(videoCoachContent.contentType),
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ionicons name="play-circle" size={64} color="white" />
                  </View>
                </ImageBackground>
              </View>
              <View className="p-4 bg-[#60e2e2]">
                <Text className="text-xs text-[#4b42b6] mb-1">Video coach</Text>
                <Text className="text-lg font-semibold text-blue-900">
                  {videoCoachContent.title}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}