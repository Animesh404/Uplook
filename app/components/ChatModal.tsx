import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '@clerk/clerk-expo';
import Logo from './Logo';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  avatar?: string;
  senderName?: string;
  timestamp: Date;
};

type ChatModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function ChatModal({ isVisible, onClose }: ChatModalProps) {
  const { user } = useAuth();
  const { user: clerkUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isVisible) {
      connectToChat();
      loadInitialMessages();
    } else {
      disconnectFromChat();
    }

    return () => {
      disconnectFromChat();
    };
  }, [isVisible]);

  const loadInitialMessages = () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        text: `Hello ${user?.fullName?.split(' ')[0] || 'there'}! I'm your wellness coach. How are you feeling today?`,
        sender: 'bot',
        senderName: 'Sarah',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
    ];
    setMessages(initialMessages);
  };

  const connectToChat = async () => {
    if (isConnecting || isConnected) return;
    
    // For now, skip WebSocket connection and use mock chat
    // TODO: Implement WebSocket when backend is ready
    console.log('Using mock chat (WebSocket not implemented yet)');
    setIsConnected(true);
    setIsConnecting(false);
    
    // Uncomment below when WebSocket is implemented
    /*
    try {
      setIsConnecting(true);
      const chatRoom = 'wellness-chat';
      const userClerkId = clerkUser?.id || 'anonymous';
      
      const wsUrl = `wss://df59b5e2226a.ngrok-free.app/chat/ws/${chatRoom}?user_clerk_id=${userClerkId}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Connected to chat');
        setIsConnected(true);
        setIsConnecting(false);
      };

      ws.current.onmessage = (event) => {
        try {
          const messageData = JSON.parse(event.data);
          const newMessage: Message = {
            id: messageData.id || Date.now().toString(),
            text: messageData.message,
            sender: messageData.sender_clerk_id === clerkUser?.id ? 'user' : 'bot',
            senderName: messageData.sender_clerk_id === clerkUser?.id ? undefined : 'Sarah',
            timestamp: new Date(messageData.timestamp),
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.current.onclose = () => {
        console.log('Disconnected from chat');
        setIsConnected(false);
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Error connecting to chat:', error);
      setIsConnecting(false);
      setIsConnected(true);
    }
    */
  };

  const disconnectFromChat = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  };

  if (!isVisible) {
    return null;
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    // Add user message immediately to UI
    const userMessage: Message = {
      id: String(Date.now()),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // For now, always use mock responses
    // TODO: Use WebSocket when backend is ready
    addMockBotResponse(messageText);
    
    // Uncomment below when WebSocket is implemented
    /*
    if (isConnected && ws.current) {
      try {
        ws.current.send(JSON.stringify({
          message: messageText,
        }));
      } catch (error) {
        console.error('Error sending message:', error);
        addMockBotResponse(messageText);
      }
    } else {
      addMockBotResponse(messageText);
    }
    */

    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addMockBotResponse = (userMessage: string) => {
    // Simple mock responses based on user input
    let botResponse = "I understand. Can you tell me more about how you're feeling?";
    
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('happy')) {
      botResponse = "That's wonderful to hear! What made your day so positive?";
    } else if (lowerMessage.includes('bad') || lowerMessage.includes('sad') || lowerMessage.includes('anxious')) {
      botResponse = "I'm sorry you're feeling that way. Would you like to try a breathing exercise or talk about what's bothering you?";
    } else if (lowerMessage.includes('stressed') || lowerMessage.includes('overwhelmed')) {
      botResponse = "Stress can be challenging. Have you tried any of the mindfulness techniques we've discussed?";
    } else if (lowerMessage.includes('meditation') || lowerMessage.includes('mindful')) {
      botResponse = "Meditation is a great practice! How has your mindfulness journey been going?";
    }

    // Add bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: String(Date.now() + 1),
        text: botResponse,
        sender: 'bot',
        senderName: 'Sarah',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
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

          {/* Connection Status */}
          {isConnecting && (
            <View className="bg-yellow-50 p-3 rounded-lg mb-4">
              <Text className="text-yellow-800 text-center">Connecting to chat...</Text>
            </View>
          )}
          
          {!isConnected && !isConnecting && (
            <View className="bg-red-50 p-3 rounded-lg mb-4">
              <Text className="text-red-800 text-center">Chat offline - using mock responses</Text>
            </View>
          )}

          {/* Chat Messages */}
          <ScrollView 
            ref={scrollViewRef}
            className="flex-1 mb-4" 
            contentContainerStyle={{ paddingBottom: 20 }}
          >
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