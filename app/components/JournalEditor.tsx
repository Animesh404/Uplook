import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type JournalEntry = {
  id?: string;
  title: string;
  content: string;
  mood?: number; // 1-5 scale
  date: Date;
};

type JournalEditorProps = {
  initialEntry?: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
  isEditing?: boolean;
};

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Very Sad' },
  { value: 2, emoji: '😕', label: 'Sad' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Happy' },
  { value: 5, emoji: '😄', label: 'Very Happy' },
];

export default function JournalEditor({ 
  initialEntry, 
  onSave, 
  onCancel, 
  isEditing = false 
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [mood, setMood] = useState<number | undefined>(initialEntry?.mood);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please add both a title and content to your journal entry.');
      return;
    }

    setIsSaving(true);
    
    try {
      const entry: JournalEntry = {
        id: initialEntry?.id,
        title: title.trim(),
        content: content.trim(),
        mood,
        date: initialEntry?.date || new Date(),
      };
      
      await onSave(entry);
    } catch (error) {
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentDate = () => {
    const date = initialEntry?.date || new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPrompts = () => [
    "How are you feeling today?",
    "What made you smile today?",
    "What challenged you today?",
    "What are you grateful for?",
    "What did you learn about yourself?",
    "How did you take care of yourself today?",
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          <View className="items-center">
            <Text className="text-lg font-semibold text-blue-900">
              {isEditing ? 'Edit Entry' : 'New Journal Entry'}
            </Text>
            <Text className="text-sm text-blue-700">{getCurrentDate()}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg ${
              isSaving ? 'bg-gray-300' : 'bg-teal-500'
            }`}
          >
            <Text className={`font-medium ${
              isSaving ? 'text-gray-500' : 'text-white'
            }`}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-6">
          {/* Title Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-blue-900 mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Give your entry a title..."
              className="bg-gray-50 rounded-xl p-4 text-gray-800 text-lg"
              maxLength={100}
            />
            <Text className="text-right text-gray-400 text-sm mt-1">
              {title.length}/100
            </Text>
          </View>

          {/* Mood Selector */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-blue-900 mb-3">How are you feeling?</Text>
            <View className="flex-row justify-between">
              {moodEmojis.map((moodOption) => (
                <TouchableOpacity
                  key={moodOption.value}
                  onPress={() => setMood(moodOption.value)}
                  className={`items-center p-3 rounded-xl ${
                    mood === moodOption.value ? 'bg-teal-100' : 'bg-gray-50'
                  }`}
                >
                  <Text className="text-3xl mb-1">{moodOption.emoji}</Text>
                  <Text className={`text-xs ${
                    mood === moodOption.value ? 'text-teal-700 font-medium' : 'text-gray-600'
                  }`}>
                    {moodOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Content Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-blue-900 mb-2">Your thoughts</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write about your day, thoughts, feelings..."
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              className="bg-gray-50 rounded-xl p-4 text-gray-800 min-h-[200px]"
              style={{ fontSize: 16, lineHeight: 24 }}
            />
            <Text className="text-right text-gray-400 text-sm mt-1">
              {content.length} characters
            </Text>
          </View>

          {/* Writing Prompts */}
          {!content && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-blue-900 mb-3">Need inspiration?</Text>
              <Text className="text-blue-700 mb-3">Try answering one of these prompts:</Text>
              {getPrompts().map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setContent(prompt + '\n\n')}
                  className="bg-blue-50 rounded-lg p-3 mb-2"
                >
                  <Text className="text-blue-800">{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tips */}
          <View className="bg-teal-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="bulb" size={20} color="#0d9488" />
              <Text className="text-teal-800 font-semibold ml-2">Journaling Tips</Text>
            </View>
            <Text className="text-teal-700 text-sm leading-5">
              • Write freely without worrying about grammar{'\n'}
              • Focus on your feelings and experiences{'\n'}
              • Be honest and authentic{'\n'}
              • Include details that matter to you
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}