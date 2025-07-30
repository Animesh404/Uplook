import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  fullName: string;
  email: string;
  age: string;
  goals: string[];
  reminderTimes: string[];
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [userData, onboardingStatus] = await Promise.all([
        AsyncStorage.getItem('user_data'),
        AsyncStorage.getItem('onboarding_complete')
      ]);

      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      setHasCompletedOnboarding(onboardingStatus === 'true');
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('onboarding_complete', 'true');
      setUser(userData);
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user_data', 'onboarding_complete']);
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const completeOnboarding = async (userData: Partial<User>) => {
    try {
      const newUser: User = {
        id: Date.now().toString(),
        fullName: userData.fullName || '',
        email: userData.email || '',
        age: userData.age || '',
        goals: userData.goals || [],
        reminderTimes: userData.reminderTimes || [],
      };

      await login(newUser);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) return;
      
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        hasCompletedOnboarding,
        login,
        logout,
        completeOnboarding,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};