import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import { apiService } from '../services/api';

interface ContentItem {
  id: number;
  title: string;
  description: string;
  content_type: string;
  category: string;
  url: string;
  thumbnail_url?: string;
  created_at: string;
}

export default function ContentScreen() {
  const { id } = useLocalSearchParams();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadContent();
    }
  }, [id]);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Try to fetch from API using the API service
      const contentData = await apiService.getContentById(Number(id));
      setContent(contentData);
    } catch (error) {
      console.error('Failed to load content from API:', error);
      // Fallback to mock content based on ID
      setContent(getMockContent(id as string));
    } finally {
      setLoading(false);
    }
  };

  const getMockContent = (contentId: string): ContentItem => {
    const mockContents: Record<string, ContentItem> = {
      '1': {
        id: 1,
        title: 'Morning Meditation',
        description: 'Start your day with a peaceful 10-minute guided meditation session. Focus on breathing and mindfulness to set a positive tone for your day.',
        content_type: 'meditation',
        category: 'anxiety',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://example.com/thumb1.jpg',
        created_at: new Date().toISOString()
      },
      '2': {
        id: 2,
        title: 'Gratitude Journal',
        description: 'Take a moment to reflect on what you\'re grateful for today. This interactive journaling experience will help you cultivate a positive mindset.',
        content_type: 'learning_module',
        category: 'self_confidence',
        url: 'https://example.com/journal',
        created_at: new Date().toISOString()
      },
      '3': {
        id: 3,
        title: 'Relaxing Sleep Music',
        description: 'Unwind with calming instrumental music designed to help you fall asleep peacefully. Perfect for your bedtime routine.',
        content_type: 'music',
        category: 'sleep',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        created_at: new Date().toISOString()
      },
      'video-1': {
        id: 4,
        title: 'How to be mindful',
        description: 'Learn practical techniques for incorporating mindfulness into your daily life.',
        content_type: 'video',
        category: 'anxiety',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        created_at: new Date().toISOString()
      }
    };
    
    return mockContents[contentId] || mockContents['1'];
  };

  const handleCompleteContent = async () => {
    try {
      // Log activity completion using API service
      if (content?.id) {
        await apiService.logActivity(content.id);
      }
      
      Alert.alert(
        'Great job!',
        'You\'ve completed this activity. Keep up the great work!',
        [
          {
            text: 'Continue',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Failed to log activity:', error);
      Alert.alert('Activity completed!', 'Great work on completing this activity.');
      router.back();
    }
  };

  const renderContentByType = () => {
    if (!content) return null;

    switch (content.content_type) {
      case 'video':
      case 'meditation':
        return (
          <View style={{ marginBottom: 24 }}>
            <VideoPlayer
              videoUrl={content.url}
              title={content.title}
            />
          </View>
        );
      
      case 'music':
        return (
          <View style={{ 
            backgroundColor: '#f3f4f6', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 24,
            alignItems: 'center'
          }}>
            <Ionicons name="musical-notes" size={64} color="#6366f1" />
            <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
              Audio Content
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#6366f1',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                marginTop: 8
              }}
              onPress={() => Linking.openURL(content.url)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Play Audio</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'learning_module':
        return (
          <View style={{ 
            backgroundColor: '#f0f9ff', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 24 
          }}>
            <Ionicons name="book" size={48} color="#0ea5e9" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, lineHeight: 24, color: '#374151' }}>
              This is an interactive learning module. You'll be guided through exercises and reflections
              to help you develop new skills and insights.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#0ea5e9',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                marginTop: 16,
                alignSelf: 'flex-start'
              }}
              onPress={() => router.push('/journal')}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Start Module</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'quiz':
        return (
          <View style={{ 
            backgroundColor: '#fef3c7', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 24 
          }}>
            <Ionicons name="help-circle" size={48} color="#f59e0b" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, lineHeight: 24, color: '#374151' }}>
              Test your knowledge and track your progress with this interactive quiz.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#f59e0b',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                marginTop: 16,
                alignSelf: 'flex-start'
              }}
              onPress={handleCompleteContent}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Take Quiz</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'article':
        return (
          <View style={{ 
            backgroundColor: '#f9fafb', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 24 
          }}>
            <Ionicons name="document-text" size={48} color="#6b7280" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, lineHeight: 24, color: '#374151', marginBottom: 16 }}>
              {content.description}
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: '#374151' }}>
              This article contains valuable insights and practical tips to help you on your wellness journey.
              Take your time to read through and reflect on the content.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#6b7280',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                marginTop: 16,
                alignSelf: 'flex-start'
              }}
              onPress={() => Linking.openURL(content.url)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Read Article</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return (
          <View style={{ 
            backgroundColor: '#f3f4f6', 
            borderRadius: 12, 
            padding: 20, 
            marginBottom: 24,
            alignItems: 'center'
          }}>
            <Ionicons name="play-circle" size={64} color="#6b7280" />
            <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
              Content Available
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#6b7280',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                marginTop: 8
              }}
              onPress={() => Linking.openURL(content.url)}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>View Content</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sleep': return '#6366f1';
      case 'anxiety': return '#10b981';
      case 'self_confidence': return '#f59e0b';
      case 'work': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
            Loading content...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#111827', 
          marginLeft: 16,
          flex: 1
        }}>
          {content?.title}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Category Badge */}
        <View style={{ 
          backgroundColor: getCategoryColor(content?.category || ''), 
          borderRadius: 20, 
          paddingHorizontal: 12, 
          paddingVertical: 6,
          alignSelf: 'flex-start',
          marginBottom: 16
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            {content?.category?.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        {/* Content Title and Description */}
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 12 }}>
          {content?.title}
        </Text>
        
        <Text style={{ fontSize: 16, lineHeight: 24, color: '#6b7280', marginBottom: 24 }}>
          {content?.description}
        </Text>

        {/* Dynamic Content Rendering */}
        {renderContentByType()}

        {/* Complete Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#0d9488',
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 24,
            alignItems: 'center',
            marginTop: 20
          }}
          onPress={handleCompleteContent}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Mark as Complete
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}