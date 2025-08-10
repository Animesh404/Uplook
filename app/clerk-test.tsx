import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function ClerkTestScreen() {
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();
  const [clerkStatus, setClerkStatus] = useState('Checking...');

  useEffect(() => {
    console.log('Clerk Test - Initial State:', {
      isLoaded,
      isSignedIn,
      user: user?.id
    });

    if (!isLoaded) {
      setClerkStatus('Clerk is loading...');
    } else if (isSignedIn && user) {
      setClerkStatus('✅ Clerk is working! User is signed in.');
    } else {
      setClerkStatus('❌ Clerk is loaded but user is not signed in.');
    }
  }, [isLoaded, isSignedIn, user]);

  const testClerkConnection = async () => {
    try {
      // Try to access Clerk's public API to test connection
      const response = await fetch('https://api.clerk.com/v1/jwks');
      if (response.ok) {
        Alert.alert('Success', 'Clerk API is accessible!');
      } else {
        Alert.alert('Error', 'Clerk API returned an error');
      }
    } catch (error) {
      Alert.alert('Error', 'Cannot connect to Clerk API');
    }
  };
  const [templateName, setTemplateName] = useState('authenticated');
  const [tokenResult, setTokenResult] = useState<string>('');
  const { getToken } = useAuth();

  const testTemplate = async () => {
    try {
      const token = await getToken({ template: templateName as any });
      setTokenResult(
        token
          ? `OK: length=${token.length}\nPayload: ${(() => {
              try { return JSON.stringify(JSON.parse(atob(token.split('.')[1])), null, 2); } catch { return 'decode failed'; }
            })()}`
          : 'No token returned'
      );
    } catch (e: any) {
      setTokenResult(`ERROR: ${e?.message || e?.toString?.() || 'unknown error'}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-100">
      <View className="flex-1 px-6 pt-4">
        <Text className="text-2xl font-bold text-blue-900 mb-6">
          Clerk Connection Test
        </Text>

        <View className="bg-white rounded-lg p-6 mb-6">
          <Text className="text-lg font-semibold mb-4">Status:</Text>
          <Text className="text-sm mb-2">{clerkStatus}</Text>
          
          <View className="mt-4 space-y-2">
            <Text className="text-xs text-gray-600">Is Loaded: {isLoaded ? '✅ Yes' : '❌ No'}</Text>
            <Text className="text-xs text-gray-600">Is Signed In: {isSignedIn ? '✅ Yes' : '❌ No'}</Text>
            <Text className="text-xs text-gray-600">User ID: {user?.id || 'None'}</Text>
            <Text className="text-xs text-gray-600">User Email: {user?.primaryEmailAddress?.emailAddress || 'None'}</Text>
            <Text className="text-xs text-gray-600">User Name: {user?.fullName || 'None'}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={testClerkConnection}
          className="bg-blue-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Test Clerk API Connection
          </Text>
        </TouchableOpacity>
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-base font-semibold mb-2">JWT Template Test</Text>
          <Text className="text-xs text-gray-600 mb-2">Pick a template and fetch token using useAuth().getToken</Text>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-gray-700">Template:</Text>
            <View className="flex-row">
              <TouchableOpacity onPress={() => setTemplateName('authenticated')} className={`px-3 py-1 rounded ${templateName==='authenticated' ? 'bg-teal-500' : 'bg-gray-200'}`}>
                <Text className={`${templateName==='authenticated' ? 'text-white' : 'text-gray-800'}`}>authenticated</Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity onPress={() => setTemplateName('supabase')} className={`px-3 py-1 rounded ${templateName==='supabase' ? 'bg-teal-500' : 'bg-gray-200'}`}>
                <Text className={`${templateName==='supabase' ? 'text-white' : 'text-gray-800'}`}>supabase</Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity onPress={() => setTemplateName('test_supabase')} className={`px-3 py-1 rounded ${templateName==='test_supabase' ? 'bg-teal-500' : 'bg-gray-200'}`}>
                <Text className={`${templateName==='test_supabase' ? 'text-white' : 'text-gray-800'}`}>test_supabase</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={testTemplate} className="bg-purple-500 rounded p-2 mb-2">
            <Text className="text-white text-center">Fetch Token</Text>
          </TouchableOpacity>
          {!!tokenResult && (
            <View className="bg-gray-100 rounded p-2">
              <Text className="text-[11px] text-gray-800">{tokenResult}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={() => router.push('/auth')}
          className="bg-teal-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Go to Auth Screen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/sign-up')}
          className="bg-green-500 rounded-lg p-4 mb-4"
        >
          <Text className="text-white font-medium text-center">
            Test Sign Up
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/sign-in')}
          className="bg-purple-500 rounded-lg p-4"
        >
          <Text className="text-white font-medium text-center">
            Test Sign In
          </Text>
        </TouchableOpacity>

        <View className="mt-6 p-4 bg-yellow-100 rounded-lg">
          <Text className="text-sm font-semibold text-yellow-800 mb-2">
            Troubleshooting Tips:
          </Text>
          <Text className="text-xs text-yellow-700 mb-1">
            • If "Clerk is loading..." never changes, check your publishable key
          </Text>
          <Text className="text-xs text-yellow-700 mb-1">
            • If "Clerk is loaded but user is not signed in", try signing up/in
          </Text>
          <Text className="text-xs text-yellow-700">
            • If API test fails, check your internet connection
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
} 