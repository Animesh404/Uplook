import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { apiService, OnboardingData } from '../services/api';

type User = {
  id: string;
  fullName: string;
  email: string;
  age: string;
  goals: string[];
  reminderTimes: string[];
  onboarded: boolean;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  clearSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, signOut: clerkSignOut, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Provide API service a token getter so protected endpoints can use real JWT
    apiService.setTokenProvider(async () => {
      try {
        const sessionToken = await getToken?.();
        console.log("Token length:", sessionToken?.length || 0);
        if (sessionToken) {
          // Decode JWT to see claims (for debugging)
          const payload = JSON.parse(atob(sessionToken.split('.')[1]));
          console.log("JWT claims:", { iss: payload.iss, aud: payload.aud, sub: payload.sub, exp: payload.exp });
        }
        return (sessionToken as string) || null;
      } catch (err) {
        console.log("Token error:", err);
        return null;
      }
    });
    
    checkAuthState();
  }, [isSignedIn, clerkUser]);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state:', { isSignedIn, clerkUserId: clerkUser?.id });
      
      if (isSignedIn && clerkUser) {
        console.log('User is signed in with Clerk:', clerkUser.id);
        
        // Check if user has completed onboarding
        const onboardingStatus = await AsyncStorage.getItem('onboarding_complete');
        const userData = await AsyncStorage.getItem('user_data');
        
        console.log('Onboarding status:', onboardingStatus);
        console.log('User data exists:', !!userData);
        
        if (onboardingStatus === 'true' && userData) {
          // User has completed onboarding
          console.log('User has completed onboarding');
          const parsedUser: User = JSON.parse(userData);

          // Merge role from Clerk public metadata if not present in storage
          const clerkRole = (clerkUser.publicMetadata as any)?.role as
            | 'USER'
            | 'ADMIN'
            | 'SUPER_ADMIN'
            | undefined;

          let mergedUser: User = parsedUser;
          if (!parsedUser.role && clerkRole) {
            mergedUser = { ...parsedUser, role: clerkRole };
            try {
              await AsyncStorage.setItem('user_data', JSON.stringify(mergedUser));
            } catch (persistErr) {
              console.warn('Failed to persist merged user role:', persistErr);
            }
          }

          // Try to fetch role from backend profile if we have a token
          try {
            const token = await getToken?.();
            if (!token) throw new Error('No auth token for /users/me');
            const profile = await apiService.getUserProfile();
            const backendRole = (profile as any)?.role as
              | 'USER'
              | 'ADMIN'
              | 'SUPER_ADMIN'
              | undefined;
            if (backendRole && backendRole !== mergedUser.role) {
              mergedUser = { ...mergedUser, role: backendRole };
              await AsyncStorage.setItem('user_data', JSON.stringify(mergedUser));
            }
          } catch (profileErr) {
            // If fetching profile fails but we do have a token, attempt to upsert the user via onboarding API
            try {
              const token = await getToken?.();
              if (token) {
                const onboardingData: OnboardingData = {
                  fullName: mergedUser.fullName,
                  email: mergedUser.email,
                  age: parseInt(mergedUser.age || '0'),
                  goals: mergedUser.goals || [],
                  reminderTimes: mergedUser.reminderTimes || [],
                };
                await apiService.completeOnboarding(onboardingData);
                // Try profile again to pick up role
                const profile = await apiService.getUserProfile();
                const backendRole = (profile as any)?.role as
                  | 'USER'
                  | 'ADMIN'
                  | 'SUPER_ADMIN'
                  | undefined;
                if (backendRole && backendRole !== mergedUser.role) {
                  mergedUser = { ...mergedUser, role: backendRole };
                  await AsyncStorage.setItem('user_data', JSON.stringify(mergedUser));
                }
              }
            } catch {
              console.log('Profile fetch failed or skipped; using local/clerk role if any');
            }
          }

          setUser(mergedUser);
          setHasCompletedOnboarding(true);
        } else {
          // User is signed in but hasn't completed onboarding
          console.log('User signed in but hasn\'t completed onboarding');
          setHasCompletedOnboarding(false);
          
          // Create a temporary user object from Clerk data
          const tempUser: User = {
            id: clerkUser.id,
            fullName: clerkUser.fullName || '',
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            age: '',
            goals: [],
            reminderTimes: [],  
            onboarded: false,
            role: (clerkUser.publicMetadata as any)?.role as any,
          };
          setUser(tempUser);
        }
      } else {
        // User is not signed in
        console.log('User is not signed in');
        setUser(null);
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = async () => {
    try {
      console.log('Clearing session and local data...');
      await AsyncStorage.multiRemove(['user_data', 'onboarding_complete']);
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const login = async (userData: User) => {
    try {
      console.log('Logging in user:', userData.id);
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
      console.log('Logging out user...');
      await AsyncStorage.multiRemove(['user_data', 'onboarding_complete']);
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out from Clerk...');
      await clerkSignOut();
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const completeOnboarding = async (userData: Partial<User>) => {
    try {
      if (!clerkUser) {
        throw new Error('No authenticated user found');
      }

      console.log('Completing onboarding for user:', clerkUser.id);

      // Prepare onboarding data
      const onboardingData: OnboardingData = {
        fullName: userData.fullName || clerkUser.fullName || '',
        email: userData.email || clerkUser.primaryEmailAddress?.emailAddress || '',
        age: parseInt(userData.age || '0'),
        goals: userData.goals || [],
        reminderTimes: userData.reminderTimes || [],
      };

      // Try to save to backend (fallback to local storage if backend is not available)
      try {
        
        console.log('Attempting to save onboarding data to backend...');
        const userProfile = await apiService.completeOnboarding(onboardingData);
        console.log('Successfully saved to backend:', userProfile);
        
        // Convert backend response to local User format
        const newUser: User = {
          id: userProfile.id,
          fullName: userProfile.full_name,
          email: userProfile.email,
          age: userProfile.age.toString(),
          goals: userProfile.goals || [],
          reminderTimes: userProfile.reminder_times || [],
          onboarded: userProfile.onboarded,
          role: (userProfile as any)?.role as any,
        };

        await login(newUser);
      } catch (backendError) {
        // const token = await getToken?.({ template: 'supabase' });
        // console.log("token", token);
        console.warn('Backend not available, saving locally:', backendError);
        
        // Fallback to local storage
        const newUser: User = {
          id: clerkUser.id,
          fullName: onboardingData.fullName,
          email: onboardingData.email,
          age: onboardingData.age.toString(),
          goals: onboardingData.goals,
          reminderTimes: onboardingData.reminderTimes,
          onboarded: true,
          role: (clerkUser.publicMetadata as any)?.role as any,
        };

        await login(newUser);
      }
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
        hasCompletedOnboarding: hasCompletedOnboarding || false,
        login,
        logout,
        completeOnboarding,
        updateUser,
        isSignedIn: isSignedIn || false,
        signOut,
        clearSession,
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