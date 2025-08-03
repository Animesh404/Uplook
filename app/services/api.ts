// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:8000'; // Change this to your actual backend URL

// Feature flags for development
const USE_MOCK_DATA = false; // Set to true to use mock data only

export interface OnboardingData {
  fullName: string;
  age: number;
  email: string;
  goals: string[];
  reminderTimes: string[];
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  age: number;
  goals: string[];
  reminder_times: string[];
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  onboarded: boolean;
  // Keep camelCase versions for backward compatibility
  fullName?: string;
  reminderTimes?: string[];
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: string;
}

export interface StreakInfo {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_percentage: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  badge_type: string;
  icon_url?: string;
  earned_at: string;
  is_completed: boolean;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    // In a real app, you'd get the Clerk token here
    // For now, we'll use a placeholder or handle auth differently
    try {
      // This would be replaced with actual Clerk token retrieval
      return 'placeholder-token';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error Response:`, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`API Response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Cannot connect to server at ${API_BASE_URL}`);
      }
      
      throw error;
    }
  }

  // User/Onboarding endpoints
  async completeOnboarding(data: OnboardingData): Promise<UserProfile> {
    // Use simplified endpoint for testing (no auth required)
    return this.makeRequest('/users/complete-onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(): Promise<UserProfile> {
    return this.makeRequest('/users/me');
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.makeRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Streak endpoints
  async getStreakInfo(): Promise<StreakInfo> {
    // Use mock data during development
    if (USE_MOCK_DATA) {
      console.log('Using mock streak data (development mode)');
      return this.getMockStreakInfo();
    }

    try {
      return await this.makeRequest('/streaks/streak');
    } catch (error) {
      console.warn('Authenticated streak endpoint failed, trying mock endpoint:', error);
      try {
        return await this.makeRequest('/streaks/mock-streak');
      } catch (mockError) {
        console.warn('Mock endpoint also failed, using fallback data:', mockError);
        return this.getMockStreakInfo();
      }
    }
  }

  async logActivity(contentId: number): Promise<{ message: string; streak: number }> {
    try {
      return await this.makeRequest('/streaks/activity', {
        method: 'POST',
        body: JSON.stringify({ content_id: contentId }),
      });
    } catch (error) {
      console.warn('Activity logging failed:', error);
      // Return mock response
      return { message: 'Activity logged (mock)', streak: 6 };
    }
  }

  // Badge endpoints
  async getUserBadges(): Promise<Badge[]> {
    // Use mock data during development
    if (USE_MOCK_DATA) {
      console.log('Using mock badge data (development mode)');
      return this.getMockBadges();
    }

    try {
      return await this.makeRequest('/streaks/badges');
    } catch (error) {
      console.warn('Authenticated badges endpoint failed, trying mock endpoint:', error);
      try {
        return await this.makeRequest('/streaks/mock-badges');
      } catch (mockError) {
        console.warn('Mock endpoint also failed, using fallback data:', mockError);
        return this.getMockBadges();
      }
    }
  }

  // Content endpoints
  async getPersonalizedContent(category?: string): Promise<any[]> {
    const query = category ? `?category=${category}` : '';
    return this.makeRequest(`/content/personalized${query}`);
  }

  // Test server connectivity
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/streaks/test');
      return true;
    } catch (error) {
      console.error('Server connection test failed:', error);
      return false;
    }
  }

  // Mock data methods for development (remove when backend is ready)
  async getMockStreakInfo(): Promise<StreakInfo> {
    // Simulate some variation in streak data
    const currentStreak = Math.floor(Math.random() * 10) + 1; // 1-10 days
    const longestStreak = Math.max(currentStreak, Math.floor(Math.random() * 30) + 5); // 5-35 days
    const streakPercentage = (currentStreak % 7) / 7 * 100; // Progress towards weekly badge

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_activity_date: new Date().toISOString(),
      streak_percentage: Math.round(streakPercentage * 10) / 10 // Round to 1 decimal
    };
  }

  async getMockBadges(): Promise<Badge[]> {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    return [
      {
        id: 1,
        name: "Getting Started",
        description: "Complete your first activity",
        badge_type: "first_activity",
        earned_at: yesterday,
        is_completed: true
      },
      {
        id: 2,
        name: "Weekly Warrior",
        description: "Complete activities for 7 consecutive days",
        badge_type: "weekly_streak",
        earned_at: now,
        is_completed: false
      },
      {
        id: 3,
        name: "Meditation Master",
        description: "Complete 50 meditation sessions",
        badge_type: "meditation_master",
        earned_at: now,
        is_completed: false
      },
      {
        id: 4,
        name: "Early Bird",
        description: "Complete morning activities for 5 days",
        badge_type: "morning_routine",
        earned_at: now,
        is_completed: Math.random() > 0.5 // Randomly completed or not
      }
    ];
  }
}

export const apiService = new ApiService();