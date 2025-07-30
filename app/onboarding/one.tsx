import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../contexts/OnboardingContext';
import ProgressHeader from '../components/ProgressHeader';
import Button from '../components/Button';

export default function OnboardingOne() {
  const { data, updateData } = useOnboarding();
  const [fullName, setFullName] = useState(data.fullName);
  const [age, setAge] = useState(data.age);
  const [email, setEmail] = useState(data.email);
  const [agreeToTerms, setAgreeToTerms] = useState(data.agreeToTerms);

  const handleContinue = () => {
    updateData({
      fullName,
      age,
      email,
      agreeToTerms,
    });
    router.push('/onboarding/two');
  };

  const handleSkip = () => {
    updateData({
      fullName,
      age,
      email,
      agreeToTerms,
    });
    router.push('/onboarding/two');
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        <ProgressHeader 
          step={1} 
          totalSteps={3} 
          onBack={() => router.back()} 
        />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-teal-100 rounded-xl p-6">
            <Text className="text-2xl font-bold text-blue-900 mb-1">
              Who are you?
            </Text>
            <Text className="text-blue-900 mb-6">
              Fill out your personal details
            </Text>
            
            <View className="mb-4">
              <Text className="font-medium text-blue-900 mb-2">Full Name</Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                className="bg-white rounded-lg p-4 text-gray-800"
              />
            </View>
            
            <View className="mb-4">
              <Text className="font-medium text-blue-900 mb-2">Age</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                keyboardType="number-pad"
                className="bg-white rounded-lg p-4 text-gray-800"
              />
            </View>
            
            <View className="mb-6">
              <Text className="font-medium text-blue-900 mb-2">Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white rounded-lg p-4 text-gray-800"
              />
            </View>
            
            <TouchableOpacity 
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              className="flex-row items-center mb-8"
            >
              <View className={`
                w-5 h-5 rounded border mr-2 items-center justify-center
                ${agreeToTerms ? 'bg-teal-500 border-teal-500' : 'border-gray-400'}
              `}>
                {agreeToTerms && <Ionicons name="checkmark" size={12} color="white" />}
              </View>
              <Text className="text-blue-900">
                I agree with the <Text className="text-teal-600">Terms and Conditions</Text>
              </Text>
            </TouchableOpacity>
            
            <Button 
              label="Continue" 
              onPress={handleContinue} 
            />
            
            <TouchableOpacity 
              className="mt-3"
              onPress={handleSkip}
            >
              <Text className="text-center text-blue-900 py-4">
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}