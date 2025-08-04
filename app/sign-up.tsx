import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Debug info
  useEffect(() => {
    console.log('SignUp Screen - Clerk State:', {
      isLoaded,
      signUpAvailable: !!signUp,
      setActiveAvailable: !!setActive
    });
  }, [isLoaded, signUp, setActive]);

  const handleSignUp = async () => {
    console.log('Starting sign up process...');
    console.log('Form data:', { email, firstName, lastName, passwordLength: password.length });
    
    if (!isLoaded) {
      console.log('Clerk not loaded yet');
      Alert.alert('Error', 'Authentication service is not ready. Please try again.');
      return;
    }
    
    if (!email || !password || !firstName || !lastName) {
      console.log('Missing required fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      console.log('Password too short');
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating user with Clerk...');
      const result = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      console.log('Sign up result:', result);
      console.log('Status:', result.status);

      if (result.status === 'complete') {
        console.log('Sign up complete, setting active session...');
        await setActive({ session: result.createdSessionId });
        console.log('Session set active, redirecting to onboarding');
        router.replace('/onboarding/one');
      } else if (result.status === 'missing_requirements') {
        console.log('Missing requirements, need email verification');
        
        // Prepare email verification
        console.log('Preparing email verification...');
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        
        // Show verification screen
        setShowVerification(true);
        Alert.alert(
          'Verification Required', 
          'Please check your email for a verification code and enter it below.',
        );
      } else {
        console.log('Sign up failed with status:', result.status);
        Alert.alert('Error', 'Sign up failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        console.log('Error message:', errorMessage);
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error', 'Sign up failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!signUp) {
      Alert.alert('Error', 'Sign up not available');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting email verification...');
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      console.log('Verification result:', result);

      if (result.status === 'complete') {
        console.log('Verification complete, checking for session...');
        
        // Check if session was automatically created
        if (result.createdSessionId) {
          console.log('Session automatically created:', result.createdSessionId);
          if (setActive) {
            await setActive({ session: result.createdSessionId });
            console.log('Session set active, redirecting to onboarding');
            router.replace('/onboarding/one');
          }
        } else {
          // If no session was created, try to create one
          console.log('No session created, attempting to create session...');
          try {
            const session = await signUp.create({});
            console.log('Session created:', session);
            
            if (setActive && session.createdSessionId) {
              await setActive({ session: session.createdSessionId });
              console.log('Session set active, redirecting to onboarding');
              router.replace('/onboarding/one');
            }
          } catch (sessionError: any) {
            console.log('Session creation error (expected if already signed in):', sessionError);
            // If we get "already signed in" error, just redirect
            if (sessionError.errors?.[0]?.code === 'session_exists') {
              console.log('User already signed in, redirecting to onboarding');
              router.replace('/onboarding/one');
            } else {
              throw sessionError;
            }
          }
        }
      } else {
        console.log('Verification failed with status:', result.status);
        Alert.alert('Error', 'Verification failed. Please check the code and try again.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        const errorCode = error.errors[0].code;
        console.log('Error message:', errorMessage);
        console.log('Error code:', errorCode);
        
        // If user is already signed in, just redirect
        if (errorCode === 'session_exists') {
          console.log('User already signed in, redirecting to onboarding');
          router.replace('/onboarding/one');
        } else {
          Alert.alert('Error', errorMessage);
        }
      } else {
        Alert.alert('Error', 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!signUp) {
      Alert.alert('Error', 'Sign up not available');
      return;
    }

    try {
      console.log('Resending verification code...');
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert('Success', 'Verification code sent again. Please check your email.');
    } catch (error: any) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    }
  };

  if (showVerification) {
    return (
      <SafeAreaView className="flex-1 bg-teal-100">
        <View className="flex-1 px-6 pt-4">
          {/* Header */}
          <TouchableOpacity 
            onPress={() => setShowVerification(false)}
            className="mb-6"
          >
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>

          <View className="flex-1 justify-center">
            <Text className="text-3xl font-bold text-blue-900 mb-2">
              Verify Your Email
            </Text>
            <Text className="text-blue-900 mb-8">
              Enter the verification code sent to {email}
            </Text>

            {/* Verification Code Input */}
            <View className="mb-6">
              <Text className="font-medium text-blue-900 mb-2">Verification Code</Text>
              <TextInput
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                className="bg-white rounded-lg p-4 text-gray-800 text-center text-lg font-mono"
                maxLength={6}
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerification}
              disabled={isLoading}
              className={`rounded-lg p-4 mb-4 ${isLoading ? 'bg-gray-400' : 'bg-teal-500'}`}
            >
              <Text className="text-white font-medium text-center">
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Text>
            </TouchableOpacity>

            {/* Resend Code */}
            <TouchableOpacity
              onPress={resendVerification}
              disabled={isLoading}
              className="mb-4"
            >
              <Text className="text-center text-teal-600">
                Didn't receive the code? Resend
              </Text>
            </TouchableOpacity>

            {/* Back to Sign Up */}
            <TouchableOpacity
              onPress={() => setShowVerification(false)}
              disabled={isLoading}
            >
              <Text className="text-center text-blue-900">
                Back to Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            Create Account
          </Text>
          <Text className="text-blue-900 mb-8">
            Sign up to get started
          </Text>

          {/* First Name Input */}
          <View className="mb-4">
            <Text className="font-medium text-blue-900 mb-2">First Name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              className="bg-white rounded-lg p-4 text-gray-800"
            />
          </View>

          {/* Last Name Input */}
          <View className="mb-4">
            <Text className="font-medium text-blue-900 mb-2">Last Name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              className="bg-white rounded-lg p-4 text-gray-800"
            />
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="font-medium text-blue-900 mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white rounded-lg p-4 text-gray-800"
            />
          </View>

          {/* Password Input */}
          <View className="mb-6">
            <Text className="font-medium text-blue-900 mb-2">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password (min 8 characters)"
              secureTextEntry
              className="bg-white rounded-lg p-4 text-gray-800"
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading || !isLoaded}
            className={`rounded-lg p-4 mb-4 ${isLoading || !isLoaded ? 'bg-gray-400' : 'bg-teal-500'}`}
          >
            <Text className="text-white font-medium text-center">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="items-center">
            <Text className="text-blue-900 mb-2">
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text className="text-teal-600 font-semibold">
                Sign in here
              </Text>
            </TouchableOpacity>
          </View>

          {/* Debug Info */}
          <View className="mt-6 p-4 bg-white rounded-lg">
            <Text className="text-sm text-gray-600 mb-2">Debug Info:</Text>
            <Text className="text-xs text-gray-500">Clerk Loaded: {isLoaded ? 'Yes' : 'No'}</Text>
            <Text className="text-xs text-gray-500">SignUp Available: {signUp ? 'Yes' : 'No'}</Text>
            <Text className="text-xs text-gray-500">SetActive Available: {setActive ? 'Yes' : 'No'}</Text>
            <Text className="text-xs text-gray-500">Loading: {isLoading ? 'Yes' : 'No'}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
} 