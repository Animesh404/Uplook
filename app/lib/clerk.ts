import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

// Replace with your Clerk publishable key
const CLERK_PUBLISHABLE_KEY = 'pk_test_aGVscGluZy1lYXJ3aWctNjUuY2xlcmsuYWNjb3VudHMuZGV2JA';

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