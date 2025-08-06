import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from '../components/VideoPlayer';
import QuizComponent from '../components/QuizComponent';
import { apiService } from '../services/api';

type ContentItem = {
  id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'quiz' | 'learning_module' | 'meditation' | 'music' | 'article';
  category: 'sleep' | 'anxiety' | 'self_confidence' | 'work';
  url: string;
  thumbnail_url?: string;
  created_at: string;
};

// Mock quiz data - in real app this would come from the backend
const mockQuizData = {
  id: 'quiz-1',
  title: 'Mindfulness Assessment',
  description: 'Test your understanding of mindfulness concepts',
  questions: [
    {
      id: 'q1',
      question: 'What is the main goal of mindfulness meditation?',
      options: [
        { id: 'a', text: 'To stop all thoughts', isCorrect: false },
        { id: 'b', text: 'To be present and aware', isCorrect: true },
        { id: 'c', text: 'To achieve enlightenment', isCorrect: false },
        { id: 'd', text: 'To relax completely', isCorrect: false },
      ],
      explanation: 'Mindfulness is about being present and aware of your thoughts, feelings, and surroundings without judgment.'
    },
    {
      id: 'q2',
      question: 'How long should a beginner meditate?',
      options: [
        { id: 'a', text: '5-10 minutes', isCorrect: true },
        { id: 'b', text: '30 minutes', isCorrect: false },
        { id: 'c', text: '1 hour', isCorrect: false },
        { id: 'd', text: '2 hours', isCorrect: false },
      ],
      explanation: 'Beginners should start with short sessions of 5-10 minutes to build the habit gradually.'
    },
    {
      id: 'q3',
      question: 'What should you do when your mind wanders during meditation?',
      options: [
        { id: 'a', text: 'Get frustrated and stop', isCorrect: false },
        { id: 'b', text: 'Gently return focus to breath', isCorrect: true },
        { id: 'c', text: 'Follow the thoughts', isCorrect: false },
        { id: 'd', text: 'Try harder to concentrate', isCorrect: false },
      ],
      explanation: 'Mind wandering is natural. Simply notice it and gently return your attention to your breath or chosen focus point.'
    }
  ]
};

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    loadContent();
  }, [id]);

  const loadContent = async () => {
    try {
      setLoading(true);
      // In a real app, fetch from backend
      // const contentData = await apiService.getContentById(id);
      
      // Mock content data for now
      const mockContent: ContentItem = {
        id: id || '1',
        title: getContentTitle(),
        description: getContentDescription(),
        content_type: getContentType(),
        category: 'anxiety',
        url: getContentUrl(),
        thumbnail_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
        created_at: new Date().toISOString(),
      };
      
      setContent(mockContent);
    } catch (error) {
      console.error('Error loading content:', error);
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getContentTitle = () => {
    switch (id) {
      case 'video-1': return 'Mindful Breathing Meditation';
      case 'quiz-1': return 'Mindfulness Assessment';
      case 'learning-1': return 'Introduction to Mindfulness';
      case 'music-1': return 'Relaxing Nature Sounds';
      default: return 'Wellness Content';
    }
  };

  const getContentDescription = () => {
    switch (id) {
      case 'video-1': return 'A guided meditation focusing on breath awareness and present moment attention.';
      case 'quiz-1': return 'Test your understanding of mindfulness concepts and practices.';
      case 'learning-1': return 'Learn the fundamentals of mindfulness and how to incorporate it into daily life.';
      case 'music-1': return 'Soothing sounds from nature to help you relax and focus.';
      default: return 'Wellness content to support your mental health journey.';
    }
  };

  const getContentType = (): ContentItem['content_type'] => {
    if (id?.startsWith('video')) return 'video';
    if (id?.startsWith('quiz')) return 'quiz';
    if (id?.startsWith('learning')) return 'learning_module';
    if (id?.startsWith('music')) return 'music';
    return 'article';
  };

  const getContentUrl = () => {
    switch (id) {
      case 'video-1': return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      case 'music-1': return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
      default: return '';
    }
  };

  const handleVideoComplete = async () => {
    try {
      // Log activity completion
      await apiService.logActivity(parseInt(id || '1'));
      Alert.alert('Great job!', 'You completed this meditation session. Keep up the good work!');
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    try {
      // Log activity completion
      await apiService.logActivity(parseInt(id || '1'));
      
      const percentage = (score / totalQuestions) * 100;
      Alert.alert(
        'Quiz Complete!', 
        `You scored ${score}/${totalQuestions} (${percentage.toFixed(0)}%). Great work!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-blue-900">Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!content) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-600">Content not found</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4 px-6 py-2 bg-teal-500 rounded-lg">
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showQuiz && content.content_type === 'quiz') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <QuizComponent
          quizData={mockQuizData}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center p-6 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#1e40af" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-blue-900">{content.title}</Text>
            <Text className="text-blue-700 capitalize">{content.content_type.replace('_', ' ')}</Text>
          </View>
        </View>

        <View className="p-6">
          {/* Description */}
          {content.description && (
            <View className="mb-6">
              <Text className="text-gray-700 text-lg leading-6">{content.description}</Text>
            </View>
          )}

          {/* Content based on type */}
          {content.content_type === 'video' && (
            <VideoPlayer
              videoUrl={content.url}
              title={content.title}
              onComplete={handleVideoComplete}
              autoPlay={false}
            />
          )}

          {content.content_type === 'quiz' && (
            <View className="bg-teal-50 rounded-xl p-6">
              <View className="items-center mb-4">
                <Ionicons name="help-circle" size={48} color="#0d9488" />
                <Text className="text-xl font-bold text-teal-900 mt-2">Ready to test your knowledge?</Text>
                <Text className="text-teal-700 text-center mt-2">
                  This quiz has {mockQuizData.questions.length} questions and will help reinforce what you've learned.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowQuiz(true)}
                className="bg-teal-500 rounded-xl py-4 items-center"
              >
                <Text className="text-white font-semibold text-lg">Start Quiz</Text>
              </TouchableOpacity>
            </View>
          )}

          {content.content_type === 'learning_module' && (
            <View className="space-y-6">
              <View className="bg-blue-50 rounded-xl p-6">
                <Text className="text-xl font-bold text-blue-900 mb-4">What You'll Learn</Text>
                <View className="space-y-3">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    <Text className="ml-3 text-blue-800">Understanding mindfulness basics</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    <Text className="ml-3 text-blue-800">Breathing techniques for stress relief</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    <Text className="ml-3 text-blue-800">Daily mindfulness practices</Text>
                  </View>
                </View>
              </View>

              <View className="bg-white border border-gray-200 rounded-xl p-6">
                <Text className="text-lg font-semibold text-blue-900 mb-4">Course Content</Text>
                <Text className="text-gray-700 leading-6 mb-4">
                  Mindfulness is the practice of being fully present and engaged in the moment, aware of where you are and what you're doing, without being overly reactive or overwhelmed by what's happening around you.
                </Text>
                <Text className="text-gray-700 leading-6 mb-4">
                  This learning module will guide you through the fundamentals of mindfulness practice, including:
                </Text>
                <View className="space-y-2 mb-6">
                  <Text className="text-gray-700">• The science behind mindfulness</Text>
                  <Text className="text-gray-700">• Basic meditation techniques</Text>
                  <Text className="text-gray-700">• Integrating mindfulness into daily activities</Text>
                  <Text className="text-gray-700">• Common challenges and how to overcome them</Text>
                </View>
                
                <TouchableOpacity
                  onPress={handleVideoComplete}
                  className="bg-blue-500 rounded-xl py-4 items-center"
                >
                  <Text className="text-white font-semibold text-lg">Mark as Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {content.content_type === 'music' && (
            <View className="bg-green-50 rounded-xl p-6">
              <View className="items-center mb-4">
                <Ionicons name="musical-notes" size={48} color="#059669" />
                <Text className="text-xl font-bold text-green-900 mt-2">Relaxing Audio</Text>
                <Text className="text-green-700 text-center mt-2">
                  Close your eyes and let these soothing sounds help you relax and find peace.
                </Text>
              </View>
              {/* Audio player would go here - for now just a placeholder */}
              <View className="bg-white rounded-lg p-4 mb-4">
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity className="bg-green-500 rounded-full p-3">
                    <Ionicons name="play" size={24} color="white" />
                  </TouchableOpacity>
                  <View className="flex-1 mx-4">
                    <View className="bg-gray-200 h-2 rounded-full">
                      <View className="bg-green-500 h-2 rounded-full w-1/3" />
                    </View>
                  </View>
                  <Text className="text-gray-600">2:30 / 8:00</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleVideoComplete}
                className="bg-green-500 rounded-xl py-4 items-center"
              >
                <Text className="text-white font-semibold text-lg">Mark as Complete</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Additional Info */}
          <View className="mt-8 p-4 bg-gray-50 rounded-xl">
            <Text className="text-gray-600 text-sm">
              Category: {content.category.replace('_', ' ')} • 
              Created: {new Date(content.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}