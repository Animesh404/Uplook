// API service for communicating with the backend
const API_BASE_URL = 'https://df59b5e2226a.ngrok-free.app'; // Change this to your actual backend URL

// Feature flags for development
const USE_MOCK_DATA = false; // Set to false to use backend API

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

export interface JournalEntry {
  id: string;
  entry_text: string;
  sentiment_score?: number;
  created_at: string;
}

export interface MoodLog {
  id: string;
  mood_rating: number;
  note?: string;
  timestamp: string;
}

// Agenda and Recommendation Service Interfaces
export interface AgendaItem {
  id: number;
  title: string;
  description: string;
  content_type: string;
  category: string;
  url: string;
  thumbnail_url: string;
  reason: string;
}

export interface DailyWrapUp {
  wellness_score: number;
  trend: string;
  completed_activities_week: number;
}

export interface ProgressSummary {
  weekly_activities: number;
  wellness_trend: string;
  next_milestone: string;
}

export interface UserAgenda {
  daily_wrap_up: DailyWrapUp;
  todays_agenda: AgendaItem[];
  progress_summary: ProgressSummary;
}

class ApiService {
  private tokenProvider?: () => Promise<string | null>;

  setTokenProvider(provider: () => Promise<string | null>) {
    this.tokenProvider = provider;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      if (this.tokenProvider) {
        return await this.tokenProvider();
      }
      return null;
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
      return await this.makeRequest(`/streaks/activity?content_id=${contentId}`, {
        method: 'POST',
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

  async getContentById(contentId: number): Promise<any> {
    return this.makeRequest(`/content/${contentId}`);
  }

  // Journal endpoints
  async getJournalEntries(): Promise<JournalEntry[]> {
    // Use mock data during development
    if (USE_MOCK_DATA) {
      console.log('Using mock journal data (development mode)');
      return this.getMockJournalEntries();
    }

    try {
      return await this.makeRequest('/journal/entries');
    } catch (error) {
      console.warn('Authenticated journal endpoint failed, trying mock endpoint:', error);
      try {
        return await this.makeRequest('/journal/mock-entries');
      } catch (mockError) {
        console.warn('Mock endpoint also failed, using fallback data:', mockError);
        return this.getMockJournalEntries();
      }
    }
  }

  async createJournalEntry(data: { entry_text: string }): Promise<JournalEntry> {
    // Use mock data during development
    if (USE_MOCK_DATA) {
      console.log('Using mock journal creation (development mode)');
      return this.getMockJournalEntry(data.entry_text);
    }

    try {
      return await this.makeRequest('/journal/entries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Authenticated create journal failed, trying mock endpoint:', error);
      try {
        return await this.makeRequest('/journal/mock-entries', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (mockError) {
        console.warn('Mock endpoint also failed, using fallback response:', mockError);
        return this.getMockJournalEntry(data.entry_text);
      }
    }
  }

  // Mood tracking endpoints
  async getMoodLogs(): Promise<MoodLog[]> {
    // Use mock data during development
    if (USE_MOCK_DATA) {
      console.log('Using mock mood data (development mode)');
      return this.getMockMoodLogs();
    }

    try {
      return await this.makeRequest('/mood/logs');
    } catch (error) {
      console.warn('Authenticated mood endpoint failed, trying mock endpoint:', error);
      try {
        return await this.makeRequest('/mood/mock-logs');
      } catch (mockError) {
        console.warn('Mock endpoint also failed, using fallback data:', mockError);
        return this.getMockMoodLogs();
      }
    }
  }

  async createMoodLog(data: { mood_rating: number; note?: string }): Promise<MoodLog> {
    // Use mock data during development
    if (USE_MOCK_DATA) {
      console.log('Using mock mood creation (development mode)');
      return this.getMockMoodLog(data.mood_rating, data.note);
    }

    try {
      return await this.makeRequest('/mood/logs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Authenticated create mood failed, trying mock endpoint:', error);
      try {
        return await this.makeRequest('/mood/mock-logs', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (mockError) {
        console.warn('Mock endpoint also failed, using fallback response:', mockError);
        return this.getMockMoodLog(data.mood_rating, data.note);
      }
    }
  }

  // Home/Agenda endpoints
  async getUserAgenda(): Promise<UserAgenda> {
    try {
      const agenda = await this.makeRequest('/home/agenda');
      console.log('✅ Backend agenda loaded:', agenda);
      return agenda;
    } catch (error) {
      console.log('🔄 Using mock agenda (backend not available):', error);
      return this.getMockAgenda();
    }
  }

  async completeActivity(contentId: number, planId?: number): Promise<any> {
    try {
      const endpoint = planId 
        ? `/home/activity/${contentId}/complete?plan_id=${planId}`
        : `/home/activity/${contentId}/complete`;
      return await this.makeRequest(endpoint, { method: 'POST' });
    } catch (error) {
      console.warn('Failed to complete activity:', error);
      return { message: 'Activity completed (mock)' };
    }
  }

  async createUserPlans(): Promise<any> {
    try {
      return await this.makeRequest('/home/create-user-plans', { method: 'POST' });
    } catch (error) {
      console.warn('Failed to create user plans:', error);
      return { message: 'Plans created (mock)', plans: [] };
    }
  }

  // Admin endpoints
  async getAdminAnalytics(): Promise<any> {
    try {
      return await this.makeRequest('/admin/analytics');
    } catch (error) {
      console.warn('Failed to get admin analytics:', error);
      return {
        total_users: 150,
        active_users: 89,
        total_content: 45,
        user_engagement: 59.3
      };
    }
  }

  async getAdminContent(): Promise<any[]> {
    try {
      return await this.makeRequest('/admin/content');
    } catch (error) {
      console.warn('Failed to get admin content:', error);
      return [];
    }
  }

  async getAdminUsers(): Promise<any[]> {
    try {
      return await this.makeRequest('/admin/users');
    } catch (error) {
      console.warn('Failed to get admin users:', error);
      return [];
    }
  }

  async createAdminContent(contentData: any): Promise<any> {
    try {
      return await this.makeRequest('/admin/content', {
        method: 'POST',
        body: JSON.stringify(contentData)
      });
    } catch (error) {
      console.warn('Failed to create admin content:', error);
      throw error;
    }
  }

  async deleteAdminContent(contentId: number): Promise<any> {
    try {
      return await this.makeRequest(`/admin/content/${contentId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('Failed to delete admin content:', error);
      throw error;
    }
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

  // Mock journal methods
  async getMockJournalEntries(): Promise<JournalEntry[]> {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    return [
      {
        id: '1',
        entry_text: 'Today was surprisingly good. I managed to complete my meditation session and felt more centered throughout the day. The breathing exercises really helped when I felt stressed about the meeting.',
        sentiment_score: 0.7,
        created_at: yesterday
      },
      {
        id: '2',
        entry_text: 'Woke up feeling anxious about the presentation. Used the mindfulness techniques to ground myself. Grateful for the tools I\'ve learned.',
        sentiment_score: 0.2,
        created_at: twoDaysAgo
      }
    ];
  }

  async getMockJournalEntry(entryText: string): Promise<JournalEntry> {
    return {
      id: Date.now().toString(),
      entry_text: entryText,
      sentiment_score: Math.random() * 0.8 + 0.1, // Random sentiment between 0.1 and 0.9
      created_at: new Date().toISOString()
    };
  }

  // Mock mood methods
  async getMockMoodLogs(): Promise<MoodLog[]> {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    return [
      {
        id: '1',
        mood_rating: 4,
        note: 'Feeling good after meditation',
        timestamp: now
      },
      {
        id: '2',
        mood_rating: 3,
        note: 'Okay day, some stress',
        timestamp: yesterday
      },
      {
        id: '3',
        mood_rating: 5,
        note: 'Great day!',
        timestamp: twoDaysAgo
      }
    ];
  }

  async getMockMoodLog(moodRating: number, note?: string): Promise<MoodLog> {
    return {
      id: Date.now().toString(),
      mood_rating: moodRating,
      note: note || '',
      timestamp: new Date().toISOString()
    };
  }

  // Mock agenda for development - fallback only
  private async getMockAgenda(): Promise<UserAgenda> {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    
    console.log('🔄 Using mock agenda (backend not available)');
    
    return {
      daily_wrap_up: {
        wellness_score: 75,
        trend: "improving",
        completed_activities_week: 12
      },
      todays_agenda: [
        {
          id: 1,
          title: 'Morning Meditation',
          description: 'Start your day with mindfulness',
          content_type: 'meditation',
          category: 'anxiety',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
          reason: 'Recommended based on your wellness goals'
        },
        {
          id: 2,
          title: 'Gratitude Journal',
          description: 'Reflect on what you\'re grateful for',
          content_type: 'learning_module',
          category: 'self_confidence',
          url: 'https://example.com/journal1',
          thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
          reason: 'Build positive mindset habits'
        },
        {
          id: 3,
          title: 'Relaxing Sleep Music',
          description: 'Unwind with calming sounds',
          content_type: 'music',
          category: 'sleep',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
          reason: 'Improve your sleep quality'
        }
      ],
      progress_summary: {
        weekly_activities: 12,
        wellness_trend: "improving",
        next_milestone: "Great progress! 3 more activities to achieve your stretch goal!"
      }
    };
  }
}

export const apiService = new ApiService();