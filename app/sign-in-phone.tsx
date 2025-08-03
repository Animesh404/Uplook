import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignInPhoneScreen() {
  const { signIn, setActive } = useSignIn();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.create({
        strategy: 'phone_code',
        phoneNumber,
      });

      if (result.status === 'needs_first_factor') {
        setCodeSent(true);
        Alert.alert('Success', 'Verification code sent to your phone');
      }
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'phone_code',
        code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/onboarding/one');
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mb-6"
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
        </TouchableOpacity>

        <View className="flex-1 justify-center">
          <Text className="text-3xl font-bold text-blue-900 mb-2">
            Phone Verification
          </Text>
          <Text className="text-blue-900 mb-8">
            {codeSent ? 'Enter the code sent to your phone' : 'Enter your phone number'}
          </Text>

          {!codeSent ? (
            <>
              {/* Phone Number Input */}
              <View className="mb-6">
                <Text className="font-medium text-blue-900 mb-2">Phone Number</Text>
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="+1 (555) 123-4567"
                  keyboardType="phone-pad"
                  className="bg-white rounded-lg p-4 text-gray-800"
                />
              </View>

              {/* Send Code Button */}
              <TouchableOpacity
                onPress={handleSendCode}
                disabled={isLoading}
                className={`rounded-lg p-4 mb-4 ${isLoading ? 'bg-gray-400' : 'bg-teal-500'}`}
              >
                <Text className="text-white font-medium text-center">
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Code Input */}
              <View className="mb-6">
                <Text className="font-medium text-blue-900 mb-2">Verification Code</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter 6-digit code"
                  keyboardType="number-pad"
                  maxLength={6}
                  className="bg-white rounded-lg p-4 text-gray-800 text-center text-lg"
                />
              </View>

              {/* Verify Code Button */}
              <TouchableOpacity
                onPress={handleVerifyCode}
                disabled={isLoading}
                className={`rounded-lg p-4 mb-4 ${isLoading ? 'bg-gray-400' : 'bg-teal-500'}`}
              >
                <Text className="text-white font-medium text-center">
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Text>
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity 
                onPress={handleSendCode}
                disabled={isLoading}
                className="mb-6"
              >
                <Text className="text-center text-teal-600">
                  Resend code
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back to Phone Number */}
          {codeSent && (
            <TouchableOpacity 
              onPress={() => setCodeSent(false)}
              className="mb-6"
            >
              <Text className="text-center text-blue-900">
                Use different phone number
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
} 