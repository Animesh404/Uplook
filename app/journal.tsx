import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import JournalEditor from './components/JournalEditor';
import MoodTracker from './components/MoodTracker';
import { AuthGuard } from './components/AuthGuard';
import { useAuth } from './contexts/AuthContext';
import { apiService, JournalEntry, MoodLog } from './services/api';

// Local types for UI compatibility
type LocalJournalEntry = {
  id: string;
  title: string;
  content: string;
  mood?: number;
  date: Date;
  sentiment_score?: number;
};

type LocalMoodEntry = {
  id: string;
  mood: number;
  date: Date;
  note?: string;
};

export default function JournalScreen() {
  return (
    <AuthGuard requireOnboarding={true}>
      <JournalScreenContent />
    </AuthGuard>
  );
}

function JournalScreenContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'list' | 'editor' | 'mood'>('list');
  const [journalEntries, setJournalEntries] = useState<LocalJournalEntry[]>([]);
  const [moodEntries, setMoodEntries] = useState<LocalMoodEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<LocalJournalEntry | undefined>();

  useEffect(() => {
    loadJournalEntries();
    loadMoodEntries();
  }, []);

  const loadJournalEntries = async () => {
    try {
      const apiEntries = await apiService.getJournalEntries();
      
      // Convert API format to local format
      const localEntries: LocalJournalEntry[] = apiEntries.map(entry => ({
        id: entry.id,
        title: `Journal Entry - ${new Date(entry.created_at).toLocaleDateString()}`,
        content: entry.entry_text,
        date: new Date(entry.created_at),
        sentiment_score: entry.sentiment_score
      }));
      
      setJournalEntries(localEntries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const loadMoodEntries = async () => {
    try {
      const apiMoods = await apiService.getMoodLogs();
      
      // Convert API format to local format
      const localMoods: LocalMoodEntry[] = apiMoods.map(mood => ({
        id: mood.id,
        mood: mood.mood_rating,
        date: new Date(mood.timestamp),
        note: mood.note
      }));
      
      setMoodEntries(localMoods);
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
  };

  const handleSaveEntry = async (entry: LocalJournalEntry) => {
    try {
      // Save to backend
      const savedEntry = await apiService.createJournalEntry({
        entry_text: entry.content
      });
      
      // Convert to local format and add to state
      const newLocalEntry: LocalJournalEntry = {
        id: savedEntry.id,
        title: `Journal Entry - ${new Date(savedEntry.created_at).toLocaleDateString()}`,
        content: savedEntry.entry_text,
        date: new Date(savedEntry.created_at),
        sentiment_score: savedEntry.sentiment_score
      };
      
      setJournalEntries(prev => [newLocalEntry, ...prev]);
      setCurrentView('list');
      setEditingEntry(undefined);
      
      Alert.alert('Success', 'Journal entry saved successfully!');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    }
  };

  const handleMoodSelect = async (mood: number, note?: string) => {
    try {
      // Save to backend
      const savedMood = await apiService.createMoodLog({
        mood_rating: mood,
        note: note
      });
      
      // Convert to local format and add to state
      const newLocalMood: LocalMoodEntry = {
        id: savedMood.id,
        mood: savedMood.mood_rating,
        date: new Date(savedMood.timestamp),
        note: savedMood.note
      };
      
      setMoodEntries(prev => [newLocalMood, ...prev]);
      
      Alert.alert('Success', 'Mood logged successfully!');
    } catch (error) {
      console.error('Error logging mood:', error);
      Alert.alert('Error', 'Failed to log mood');
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setJournalEntries(prev => prev.filter(e => e.id !== entryId));
            // In real app: await apiService.deleteJournalEntry(entryId);
          }
        }
      ]
    );
  };

  if (currentView === 'editor') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <JournalEditor
          initialEntry={editingEntry}
          onSave={handleSaveEntry}
          onCancel={() => {
            setCurrentView('list');
            setEditingEntry(undefined);
          }}
          isEditing={!!editingEntry}
        />
      </SafeAreaView>
    );
  }

  if (currentView === 'mood') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center p-6 border-b border-gray-200">
          <TouchableOpacity onPress={() => setCurrentView('list')} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#1e40af" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-blue-900">Mood Tracker</Text>
        </View>
        <MoodTracker
          moodHistory={moodEntries}
          onMoodSelect={handleMoodSelect}
          showHistory={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#1e40af" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-blue-900">Journal</Text>
              <Text className="text-blue-700">Track your thoughts and mood</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setCurrentView('editor')}
            className="bg-teal-500 rounded-full p-3"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="p-6">
          {/* Quick Actions */}
          <View className="flex-row space-x-3 mb-8">
            <TouchableOpacity
              onPress={() => setCurrentView('editor')}
              className="flex-1 bg-blue-50 rounded-xl p-4 items-center"
            >
              <Ionicons name="create" size={32} color="#1e40af" />
              <Text className="text-blue-900 font-semibold mt-2">Write Entry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setCurrentView('mood')}
              className="flex-1 bg-teal-50 rounded-xl p-4 items-center"
            >
              <Ionicons name="happy" size={32} color="#0d9488" />
              <Text className="text-teal-900 font-semibold mt-2">Log Mood</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Entries */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-blue-900 mb-4">Recent Entries</Text>
            
            {journalEntries.length === 0 ? (
              <View className="bg-gray-50 rounded-xl p-8 items-center">
                <Ionicons name="book" size={48} color="#9ca3af" />
                <Text className="text-gray-500 text-lg font-medium mt-4">No entries yet</Text>
                <Text className="text-gray-400 text-center mt-2">
                  Start journaling to track your thoughts and feelings
                </Text>
                <TouchableOpacity
                  onPress={() => setCurrentView('editor')}
                  className="bg-teal-500 rounded-lg px-6 py-3 mt-4"
                >
                  <Text className="text-white font-semibold">Write First Entry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-4">
                {journalEntries.map((entry) => (
                  <TouchableOpacity
                    key={entry.id}
                    onPress={() => {
                      setEditingEntry(entry);
                      setCurrentView('editor');
                    }}
                    className="bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className="text-lg font-semibold text-blue-900 flex-1">
                        {entry.title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteEntry(entry.id)}
                        className="p-1"
                      >
                        <Ionicons name="trash" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <Text className="text-gray-700 mb-3" numberOfLines={2}>
                      {entry.content}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-500 text-sm">
                        {entry.date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      
                      <View className="flex-row items-center space-x-2">
                        {entry.mood && (
                          <View className="flex-row items-center">
                            <Text className="text-lg mr-1">
                              {entry.mood === 1 ? '😢' : 
                               entry.mood === 2 ? '😕' :
                               entry.mood === 3 ? '😐' :
                               entry.mood === 4 ? '😊' : '😄'}
                            </Text>
                          </View>
                        )}
                        
                        {entry.sentiment_score !== undefined && (
                          <View className={`px-2 py-1 rounded-full ${
                            entry.sentiment_score > 0.3 ? 'bg-green-100' :
                            entry.sentiment_score < -0.3 ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              entry.sentiment_score > 0.3 ? 'text-green-700' :
                              entry.sentiment_score < -0.3 ? 'text-red-700' : 'text-gray-700'
                            }`}>
                              {entry.sentiment_score > 0.3 ? 'Positive' :
                               entry.sentiment_score < -0.3 ? 'Negative' : 'Neutral'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Insights */}
          {journalEntries.length > 0 && (
            <View className="bg-blue-50 rounded-xl p-6">
              <Text className="text-lg font-semibold text-blue-900 mb-3">
                Your Journaling Insights
              </Text>
              <View className="space-y-2">
                <Text className="text-blue-800">
                  📝 You've written {journalEntries.length} journal entries
                </Text>
                <Text className="text-blue-800">
                  🎭 Average mood: {(journalEntries.reduce((acc, entry) => acc + (entry.mood || 3), 0) / journalEntries.length).toFixed(1)}/5
                </Text>
                <Text className="text-blue-800">
                  ✨ Keep writing to track your emotional patterns over time
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}