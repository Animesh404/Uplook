import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { apiService } from '../services/api';

type ContentItem = {
  id: number;
  title: string;
  description: string;
  content_type: string;
  category: string;
  url: string;
  thumbnail_url?: string;
  created_at: string;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  current_streak: number;
  created_at: string;
};

type Analytics = {
  total_users: number;
  active_users: number;
  total_content: number;
  user_engagement: number;
};

export default function AdminScreen() {
  return <AdminScreenContent />;
}

function AdminScreenContent() {
  const { user, signOut } = useAuth();
  const { getToken } = useClerkAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'users' | 'badges'>('analytics');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Data states
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Form states
  const [newContent, setNewContent] = useState({
    title: '',
    description: '',
    content_type: 'video',
    category: 'sleep',
    url: ''
  });

  useEffect(() => {
    // Check if user has admin access
    const role = (user as any)?.role;
    if (!user || (role !== 'admin' && role !== 'super_admin')) {
      Alert.alert('Access Denied', 'You do not have admin privileges.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }
    
    fetchData();
  }, [user]);

  const getAuthToken = async () => {
    try {
      return await getToken?.();
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch real data from API using API service
      const [analyticsData, contentData, usersData] = await Promise.allSettled([
        apiService.getAdminAnalytics(),
        apiService.getAdminContent(),
        apiService.getAdminUsers()
      ]);

      if (analyticsData.status === 'fulfilled') {
        setAnalytics(analyticsData.value);
      } else {
        // Fallback analytics
        setAnalytics({
          total_users: 150,
          active_users: 89,
          total_content: 45,
          user_engagement: 59.3
        });
      }

      if (contentData.status === 'fulfilled') {
        setContent(contentData.value);
      } else {
        // Fallback content
        setContent([
          {
            id: 1,
            title: 'Morning Meditation',
            description: 'Start your day with mindfulness',
            content_type: 'video',
            category: 'anxiety',
            url: 'https://example.com/video1',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Sleep Sounds',
            description: 'Relaxing sounds for better sleep',
            content_type: 'music',
            category: 'sleep',
            url: 'https://example.com/audio1',
            created_at: new Date().toISOString()
          }
        ]);
      }

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value);
      } else {
        // Fallback users
        setUsers([
          {
            id: 1,
            full_name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
            current_streak: 5,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'user',
            current_streak: 12,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      Alert.alert('Notice', 'Using offline mode for admin panel');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!newContent.title || !newContent.url) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const createdContent = await apiService.createAdminContent({
        title: newContent.title,
        description: newContent.description,
        content_type: newContent.content_type,
        category: newContent.category,
        url: newContent.url,
        thumbnail_url: null
      });
      
      setContent([createdContent, ...content]);
      setNewContent({
        title: '',
        description: '',
        content_type: 'video',
        category: 'sleep',
        url: ''
      });
      setShowModal(false);
      Alert.alert('Success', 'Content created successfully');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to create content:', error);
      Alert.alert('Error', 'Failed to create content. Please try again.');
    }
  };

  const handleDeleteContent = (id: number) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAdminContent(id);
              setContent(content.filter(item => item.id !== id));
              Alert.alert('Success', 'Content deleted successfully');
            } catch (error) {
              console.error('Failed to delete content:', error);
              Alert.alert('Error', 'Failed to delete content. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderAnalytics = () => (
    <View>
      <Text className="text-2xl font-bold text-blue-900 mb-6">Analytics Dashboard</Text>
      
      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-white rounded-xl p-4 mb-4">
          <Text className="text-3xl font-bold text-teal-600">{analytics?.total_users}</Text>
          <Text className="text-gray-600">Total Users</Text>
        </View>
        
        <View className="w-[48%] bg-white rounded-xl p-4 mb-4">
          <Text className="text-3xl font-bold text-blue-600">{analytics?.active_users}</Text>
          <Text className="text-gray-600">Active Users</Text>
        </View>
        
        <View className="w-[48%] bg-white rounded-xl p-4 mb-4">
          <Text className="text-3xl font-bold text-purple-600">{analytics?.total_content}</Text>
          <Text className="text-gray-600">Total Content</Text>
        </View>
        
        <View className="w-[48%] bg-white rounded-xl p-4 mb-4">
          <Text className="text-3xl font-bold text-green-600">{analytics?.user_engagement.toFixed(1)}%</Text>
          <Text className="text-gray-600">Engagement</Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => (
    <View>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-blue-900">Content Management</Text>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-teal-500 rounded-lg px-4 py-2 flex-row items-center"
        >
          <Ionicons name="add" size={16} color="white" />
          <Text className="text-white font-medium ml-1">Add Content</Text>
        </TouchableOpacity>
      </View>

      {content.map((item) => (
        <View key={item.id} className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-blue-900">{item.title}</Text>
              <Text className="text-gray-600 mb-2">{item.description}</Text>
              <View className="flex-row">
                <Text className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded mr-2">
                  {item.content_type}
                </Text>
                <Text className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {item.category}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteContent(item.id)}
              className="p-2"
            >
              <Ionicons name="trash" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderUsers = () => (
    <View>
      <Text className="text-2xl font-bold text-blue-900 mb-6">User Management</Text>
      
      {users.map((user) => (
        <View key={user.id} className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-blue-900">{user.full_name}</Text>
              <Text className="text-gray-600">{user.email}</Text>
              <Text className="text-sm text-teal-600">Streak: {user.current_streak} days</Text>
            </View>
            <View className="items-end">
              <Text className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {user.role}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-blue-900">Admin Panel</Text>
          <TouchableOpacity onPress={signOut}>
            <Ionicons name="log-out" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row px-6 mb-4">
          {[
            { id: 'analytics', label: 'Analytics', icon: 'bar-chart' },
            { id: 'content', label: 'Content', icon: 'videocam' },
            { id: 'users', label: 'Users', icon: 'people' },
            { id: 'badges', label: 'Badges', icon: 'medal' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              className={`flex-1 items-center py-3 mx-1 rounded-lg ${
                activeTab === tab.id ? 'bg-white' : 'bg-transparent'
              }`}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? '#0d9488' : '#64748b'} 
              />
              <Text className={`text-xs mt-1 ${
                activeTab === tab.id ? 'text-teal-600 font-medium' : 'text-gray-500'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-6">
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'content' && renderContent()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'badges' && (
            <View>
              <Text className="text-2xl font-bold text-blue-900 mb-6">Badge Management</Text>
              <Text className="text-gray-600 text-center py-8">Badge management coming soon...</Text>
            </View>
          )}
        </ScrollView>

        {/* Add Content Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View className="flex-1 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-blue-900">Add New Content</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                value={newContent.title}
                onChangeText={(text) => setNewContent({...newContent, title: text})}
                placeholder="Content Title"
                className="bg-gray-100 rounded-lg p-3 mb-3"
              />

              <TextInput
                value={newContent.description}
                onChangeText={(text) => setNewContent({...newContent, description: text})}
                placeholder="Description"
                multiline
                numberOfLines={3}
                className="bg-gray-100 rounded-lg p-3 mb-3"
              />

              <TextInput
                value={newContent.url}
                onChangeText={(text) => setNewContent({...newContent, url: text})}
                placeholder="Content URL (video/audio file URL)"
                className="bg-gray-100 rounded-lg p-3 mb-3"
              />

              {/* Content Type Selector */}
              <Text className="text-sm font-medium text-gray-700 mb-2">Content Type</Text>
              <View className="flex-row flex-wrap mb-3">
                {['video', 'music', 'meditation', 'quiz', 'article', 'learning_module'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setNewContent({...newContent, content_type: type})}
                    className={`px-3 py-1 rounded-full mr-2 mb-2 ${
                      newContent.content_type === type ? 'bg-teal-500' : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`text-sm ${
                      newContent.content_type === type ? 'text-white' : 'text-gray-700'
                    }`}>
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category Selector */}
              <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
              <View className="flex-row flex-wrap mb-4">
                {['sleep', 'anxiety', 'self_confidence', 'work'].map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setNewContent({...newContent, category})}
                    className={`px-3 py-1 rounded-full mr-2 mb-2 ${
                      newContent.category === category ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  >
                    <Text className={`text-sm ${
                      newContent.category === category ? 'text-white' : 'text-gray-700'
                    }`}>
                      {category.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleCreateContent}
                className="bg-teal-500 rounded-lg p-4"
              >
                <Text className="text-white font-medium text-center">Create Content</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}