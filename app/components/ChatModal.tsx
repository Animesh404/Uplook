import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from './Logo'; // Assuming Logo component is in components/Logo.tsx

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  avatar?: string;
  senderName?: string;
};

type ChatModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function ChatModal({ isVisible, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! How was your day?',
      sender: 'bot',
      senderName: 'Sarah',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    {
      id: '2',
      text: 'Hi Alisha, can you tell me more about how your day was?',
      sender: 'bot',
      senderName: 'Sarah',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    {
      id: '3',
      text: 'I wasn\'t anxious for a first time in a long time',
      sender: 'user',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    {
      id: '4',
      text: 'That\'s an improvement!',
      sender: 'bot',
      senderName: 'Sarah',
      avatar: '/placeholder.svg?height=40&width=40',
    },
  ]);
  const [inputText, setInputText] = useState('');

  if (!isVisible) {
    return null;
  }

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: String(Date.now()),
        text: inputText.trim(),
        sender: 'user',
        avatar: '/placeholder.svg?height=40&width=40', // User's avatar
      };
      setMessages([...messages, newMessage]);
      setInputText('');
      // In a real app, you'd send this message to your chatbot API here
      // and then add the bot's response to the messages state.
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.sender === 'user';
    return (
      <View className={`flex-row items-end mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && message.avatar && (
          <Image source={{ uri: message.avatar }} className="w-10 h-10 rounded-full mr-3" />
        )}
        <View className={`
          max-w-[70%] p-3 rounded-xl
          ${isUser ? 'bg-blue-400 rounded-br-none' : 'bg-teal-200 rounded-bl-none'}
        `}>
          {!isUser && message.senderName && (
            <Text className="text-xs text-gray-600 mb-1">{message.senderName}</Text>
          )}
          <Text className={`${isUser ? 'text-white' : 'text-blue-900'}`}>
            {message.text}
          </Text>
        </View>
        {isUser && message.avatar && (
          <Image source={{ uri: message.avatar }} className="w-10 h-10 rounded-full ml-3" />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="absolute inset-0 bg-teal-100 z-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between w-full mb-6">
            <View className="flex-row items-center">
              <Logo size="small" />
              <Text className="ml-2 text-teal-600 font-medium">Uplook</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView className="flex-1 mb-4" contentContainerStyle={{ paddingBottom: 20 }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </ScrollView>

          {/* Message Input */}
          <View className="flex-row items-center bg-blue-300 rounded-full p-2">
            <TextInput
              className="flex-1 text-white text-base px-4"
              placeholder="Type your message..."
              placeholderTextColor="#e0f2f7"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="bg-blue-500 p-3 rounded-full ml-2"
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}