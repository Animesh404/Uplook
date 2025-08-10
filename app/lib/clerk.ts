import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Replace with your Clerk publishable key
const CLERK_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.eas?.clerk_public_key;

// Secure token cache implementation
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export { ClerkProvider, tokenCache, CLERK_PUBLISHABLE_KEY }; 