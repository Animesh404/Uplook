import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type MoodEntry = {
  id: string;
  mood: number; // 1-5 scale
  date: Date;
  note?: string;
};

type MoodTrackerProps = {
  moodHistory?: MoodEntry[];
  onMoodSelect: (mood: number, note?: string) => void;
  showHistory?: boolean;
};

const moodData = [
  { value: 1, emoji: '😢', label: 'Terrible', color: '#dc2626', bgColor: '#fef2f2' },
  { value: 2, emoji: '😕', label: 'Bad', color: '#ea580c', bgColor: '#fff7ed' },
  { value: 3, emoji: '😐', label: 'Okay', color: '#d97706', bgColor: '#fffbeb' },
  { value: 4, emoji: '😊', label: 'Good', color: '#059669', bgColor: '#f0fdf4' },
  { value: 5, emoji: '😄', label: 'Great', color: '#0d9488', bgColor: '#f0fdfa' },
];

export default function MoodTracker({ 
  moodHistory = [], 
  onMoodSelect, 
  showHistory = true 
}: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleMoodSelect = (moodValue: number) => {
    setSelectedMood(moodValue);
    setShowNoteInput(true);
  };

  const handleSaveMood = () => {
    if (selectedMood) {
      onMoodSelect(selectedMood, note.trim() || undefined);
      setSelectedMood(null);
      setNote('');
      setShowNoteInput(false);
    }
  };

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0;
    const sum = moodHistory.reduce((acc, entry) => acc + entry.mood, 0);
    return sum / moodHistory.length;
  };

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return 'neutral';
    const recent = moodHistory.slice(-7); // Last 7 entries
    const older = moodHistory.slice(-14, -7); // Previous 7 entries
    
    if (recent.length === 0 || older.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((acc, entry) => acc + entry.mood, 0) / recent.length;
    const olderAvg = older.reduce((acc, entry) => acc + entry.mood, 0) / older.length;
    
    if (recentAvg > olderAvg + 0.3) return 'improving';
    if (recentAvg < olderAvg - 0.3) return 'declining';
    return 'stable';
  };

  const getTrendIcon = () => {
    const trend = getMoodTrend();
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = () => {
    const trend = getMoodTrend();
    switch (trend) {
      case 'improving': return '#059669';
      case 'declining': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getWeeklyMoodChart = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayEntry = moodHistory.find(entry => 
        entry.date.toDateString() === date.toDateString()
      );
      
      last7Days.push({
        date,
        mood: dayEntry?.mood || 0,
        hasEntry: !!dayEntry
      });
    }
    
    return last7Days;
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-blue-900 mb-2">How are you feeling?</Text>
          <Text className="text-blue-700">Track your mood to understand patterns over time</Text>
        </View>

        {/* Mood Selection */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-blue-900 mb-4">Select your current mood</Text>
          <View className="flex-row justify-between">
            {moodData.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                onPress={() => handleMoodSelect(mood.value)}
                className={`items-center p-4 rounded-2xl ${
                  selectedMood === mood.value ? 'ring-2 ring-teal-500' : ''
                }`}
                style={{ 
                  backgroundColor: selectedMood === mood.value ? mood.bgColor : '#f9fafb',
                  width: (width - 80) / 5 
                }}
              >
                <Text className="text-3xl mb-2">{mood.emoji}</Text>
                <Text 
                  className="text-xs font-medium text-center"
                  style={{ color: selectedMood === mood.value ? mood.color : '#6b7280' }}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note Input */}
        {showNoteInput && (
          <View className="mb-8 p-4 bg-gray-50 rounded-xl">
            <Text className="text-lg font-semibold text-blue-900 mb-3">
              Add a note (optional)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What's contributing to this mood?"
              multiline
              numberOfLines={3}
              className="bg-white rounded-lg p-3 text-gray-800 mb-4"
            />
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setShowNoteInput(false);
                  setSelectedMood(null);
                  setNote('');
                }}
                className="flex-1 py-3 bg-gray-200 rounded-lg"
              >
                <Text className="text-center font-medium text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveMood}
                className="flex-1 py-3 bg-teal-500 rounded-lg"
              >
                <Text className="text-center font-medium text-white">Save Mood</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mood History */}
        {showHistory && moodHistory.length > 0 && (
          <View className="mb-8">
            <Text className="text-lg font-semibold text-blue-900 mb-4">Your mood this week</Text>
            
            {/* Weekly Chart */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <View className="flex-row justify-between items-end h-32">
                {getWeeklyMoodChart().map((day, index) => (
                  <View key={index} className="items-center flex-1">
                    <View 
                      className={`w-6 rounded-full mb-2 ${
                        day.hasEntry ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                      style={{ 
                        height: day.hasEntry ? (day.mood / 5) * 80 + 20 : 8 
                      }}
                    />
                    <Text className="text-xs text-gray-600">
                      {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row space-x-4">
              <View className="flex-1 bg-blue-50 rounded-xl p-4">
                <Text className="text-blue-900 font-semibold">Average Mood</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-2xl font-bold text-blue-900">
                    {getAverageMood().toFixed(1)}
                  </Text>
                  <Text className="text-blue-700 ml-1">/5.0</Text>
                </View>
              </View>
              
              <View className="flex-1 bg-teal-50 rounded-xl p-4">
                <Text className="text-teal-900 font-semibold">Trend</Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons 
                    name={getTrendIcon()} 
                    size={20} 
                    color={getTrendColor()} 
                  />
                  <Text 
                    className="ml-1 font-medium capitalize"
                    style={{ color: getTrendColor() }}
                  >
                    {getMoodTrend()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recent Entries */}
        {moodHistory.length > 0 && (
          <View>
            <Text className="text-lg font-semibold text-blue-900 mb-4">Recent entries</Text>
            {moodHistory.slice(-5).reverse().map((entry) => {
              const moodInfo = moodData.find(m => m.value === entry.mood);
              return (
                <View key={entry.id} className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3">
                  <Text className="text-2xl mr-3">{moodInfo?.emoji}</Text>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="font-medium text-gray-900">{moodInfo?.label}</Text>
                      <Text className="text-gray-500 ml-2">
                        {entry.date.toLocaleDateString()}
                      </Text>
                    </View>
                    {entry.note && (
                      <Text className="text-gray-600 text-sm mt-1">{entry.note}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}