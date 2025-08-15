import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import Logo from "../../components/Logo";
import ChatModal from "../../components/ChatModal";
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '@clerk/clerk-expo';
import { apiService, UserAgenda, AgendaItem } from '../../services/api';

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const Screen = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0ffff" }}>
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16 }}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default function HomeScreen() {
  const [isChatModalVisible, setIsChatModalVisible] = React.useState(false);
  const [agendaData, setAgendaData] = React.useState<UserAgenda | null>(null);
  const [isLoadingAgenda, setIsLoadingAgenda] = React.useState(true);
  const { user } = useAuth();
  const { user: clerkUser } = useUser();

  // Get user's first name - always returns a string
  const getUserFirstName = (): string => {
    try {
      const fullName = user?.fullName || clerkUser?.fullName || '';
      const firstName = fullName.split(' ')[0];
      return firstName && firstName.trim() ? firstName.trim() : 'there';
    } catch (error) {
      return 'there';
    }
  };

  // Get greeting based on time of day - always returns a string
  const getGreeting = (): string => {
    try {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      return 'Good evening';
    } catch (error) {
      return 'Hello';
    }
  };

  // Get current date - always returns a string
  const getCurrentDate = (): string => {
    try {
      const today = new Date();
      return today.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch (error) {
      // Fallback to ISO format
      return new Date().toISOString().split('T')[0];
    }
  };

  const activityBackgroundImages = [
    require('../../../assets/images/gratitude.jpeg'),
    require('../../../assets/images/meditate.jpeg'),
    require('../../../assets/images/learning.jpeg'),
    require('../../../assets/images/quiz.jpeg'),
  ];

  // Get personalized activities based on user goals
  const getPersonalizedActivities = (): string[] => {
    const defaultActivities = [
      "Fill out gratitude journal",
      "Meditate",
      "Learning module",
      "Quiz",
    ];

    try {
      if (user?.goals && user.goals.length > 0) {
        // Create personalized activities based on user goals
        const personalizedActivities = user.goals.map(goal => {
          const goalLower = goal.toLowerCase();
          if (goalLower.includes('meditation')) return 'Meditation session';
          if (goalLower.includes('exercise') || goalLower.includes('fitness')) return 'Quick workout';
          if (goalLower.includes('sleep')) return 'Sleep hygiene check';
          if (goalLower.includes('stress') || goalLower.includes('anxiety')) return 'Stress relief';
          if (goalLower.includes('gratitude')) return 'Gratitude practice';
          return `${goal} practice`;
        });

        // Combine personalized and default activities
        return [...personalizedActivities.slice(0, 2), ...defaultActivities.slice(0, 2)];
      }
    } catch (error) {
      console.warn('Error getting personalized activities:', error);
    }

    return defaultActivities;
  };

  // Fetch agenda data from recommendation service
  React.useEffect(() => {
    const fetchAgenda = async () => {
      try {
        setIsLoadingAgenda(true);
        const agenda = await apiService.getUserAgenda();
        setAgendaData(agenda);
        console.log('✅ Agenda loaded:', agenda);
      } catch (error) {
        console.error('❌ Failed to load agenda:', error);
        // Fallback to mock data if API fails
        setAgendaData({
          daily_wrap_up: {
            wellness_score: 75,
            trend: "improving",
            completed_activities_week: 12
          },
          todays_agenda: [],
          progress_summary: {
            weekly_activities: 12,
            wellness_trend: "improving",
            next_milestone: "Complete 3 more activities to reach your weekly goal!"
          }
        });
      } finally {
        setIsLoadingAgenda(false);
      }
    };

    fetchAgenda();
  }, []);

  // Get personalized message based on wellness data - always returns a string
  const getPersonalizedMessage = (): string => {
    try {
      if (agendaData?.daily_wrap_up?.wellness_score) {
        const score = agendaData.daily_wrap_up.wellness_score;
        if (score < 50) {
          return 'Let\'s focus on improving your wellness today!';
        } else if (score < 75) {
          return 'You\'re doing well! Keep up the good work!';
        } else {
          return 'Excellent! You\'re in a great place today!';
        }
      }
      
      if (user?.goals && user.goals.length > 0) {
        const primaryGoal = user.goals[0];
        const goalLower = primaryGoal.toLowerCase();
        if (goalLower.includes('meditation')) {
          return 'Take a moment to center yourself today!';
        } else if (goalLower.includes('exercise')) {
          return 'Your body and mind will thank you for moving today!';
        } else if (goalLower.includes('sleep')) {
          return 'Prioritize your rest and recovery today!';
        } else if (goalLower.includes('stress')) {
          return 'Remember to breathe and stay present today!';
        }
      }
    } catch (error) {
      console.warn('Error getting personalized message:', error);
    }
    
    return "You're one step closer to reaching your goals!";
  };

  // Get wellness trend message - always returns a string
  const getWellnessTrendMessage = (): string => {
    try {
      if (agendaData?.daily_wrap_up?.trend) {
        const trend = agendaData.daily_wrap_up.trend;
        if (trend === 'improving') {
          return 'Your wellness is improving! 🎉';
        } else if (trend === 'declining') {
          return 'Let\'s focus on getting back on track! 💪';
        } else {
          return 'Maintaining steady progress! 📈';
        }
      }
    } catch (error) {
      console.warn('Error getting wellness trend message:', error);
    }
    
    return '';
  };

  // Handle activity completion and navigation
  const handleActivityPress = async (item: AgendaItem) => {
    try {
      console.log(`🎯 User pressed: ${item.title} (${item.content_type})`);
      
      // Navigate to content based on type
      if (item.content_type === 'video' || item.content_type === 'meditation') {
        console.log(`🎬 Navigating to content/${item.id}`);
        router.push(`/content/${item.id}`);
      } else if (item.content_type === 'learning_module') {
        console.log(`📚 Navigating to journal/reflection`);
        router.push('/journal');
      } else if (item.content_type === 'music') {
        console.log(`🎵 Playing music content`);
        router.push(`/content/${item.id}`);
      } else {
        console.log(`✅ Marking activity as completed`);
        // For other types, mark as completed
        await apiService.completeActivity(item.id);
        // Refresh agenda data after completion
        const updatedAgenda = await apiService.getUserAgenda();
        setAgendaData(updatedAgenda);
      }
    } catch (error) {
      console.error('Failed to handle activity:', error);
    }
  };

  // Get content type icon
  const getContentTypeIcon = (contentType: string): string => {
    switch (contentType) {
      case 'meditation':
        return 'leaf';
      case 'music':
        return 'musical-notes';
      case 'learning_module':
        return 'school';
      case 'video':
        return 'play-circle';
      default:
        return 'book';
    }
  };

  // Get content type color - using consistent blue overlay
  const getContentTypeColor = (contentType: string): string => {
    return 'rgba(42, 191, 234, 0.7)';
  };

  // Safe text utility function
  const safeText = (text: any): string => {
    if (typeof text === 'string') return text;
    if (typeof text === 'number') return text.toString();
    if (text === null || text === undefined) return '';
    return String(text);
  };

  return (
    <Screen>
      <ScrollView>
        <View style={{ padding: 20, paddingBottom: 32 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
            }}
          >
            <Logo size="small" />
            <Text
              style={{
                marginLeft: 8,
                color: "#0f766e",
                fontWeight: "500",
                fontSize: 16,
              }}
            >
              Uplook
            </Text>
          </View>

          {/* Welcome Card */}
          <View
            style={{
              backgroundColor: "#60e2e2",
              borderRadius: 24,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: "#0f172a",
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              {`${getGreeting()}, ${getUserFirstName()}!`}
            </Text>
            <Text style={{ color: "#1e293b", marginTop: 4 }}>
              {getPersonalizedMessage()}
            </Text>
            
            {/* Wellness Score Display */}
            {agendaData?.daily_wrap_up?.wellness_score && (
              <View
                style={{
                  backgroundColor: "#ebffff",
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 16,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    color: "#0f172a",
                    fontWeight: "bold",
                    fontSize: 18,
                  }}
                >
                  {`Wellness Score: ${agendaData.daily_wrap_up.wellness_score}/100`}
                </Text>
                {(() => {
                  const trendMessage = getWellnessTrendMessage();
                  return trendMessage ? (
                    <Text style={{ color: "#1e293b", marginTop: 4 }}>
                      {trendMessage}
                    </Text>
                  ) : null;
                })()}
                <Text style={{ color: "#1e293b", marginTop: 4 }}>
                  {`Weekly activities: ${agendaData.daily_wrap_up.completed_activities_week}`}
                </Text>
              </View>
            )}

            <View
              style={{
                backgroundColor: "#ebffff",
                borderRadius: 16,
                padding: 16,
                marginTop: 0,
              }}
            >
              <Text
                style={{
                  color: "#0f172a",
                  fontWeight: "bold",
                  fontSize: 18,
                }}
              >
                Start your daily wrap-up
              </Text>
              <Text style={{ color: "#1e293b", marginTop: 4 }}>
                Have a chat with a specialist
              </Text>
              <TouchableOpacity
                onPress={() => setIsChatModalVisible(true)}
                style={{
                  backgroundColor: "#88d2f2",
                  borderRadius: 999,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignSelf: "flex-start",
                  marginTop: 12,
                  borderWidth: 1,
                  borderColor: "#002d62",
                }}
              >
                <Text style={{ color: "#0f172a", fontWeight: "600" }}>
                  Start chat
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ChatModal
            isVisible={isChatModalVisible}
            onClose={() => setIsChatModalVisible(false)}
          />

          {/* Today's Agenda */}
          <View style={{ marginBottom: 32 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#0f172a",
                }}
              >
                Today's agenda
              </Text>
              <Text style={{ fontSize: 14, color: "#475569" }}>
                {getCurrentDate()}
              </Text>
            </View>

            {isLoadingAgenda ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color="#60e2e2" />
                <Text style={{ marginTop: 16, color: '#64748b' }}>
                  Loading your personalized agenda...
                </Text>
              </View>
            ) : agendaData && agendaData.todays_agenda && agendaData.todays_agenda.length > 0 ? (
              <View>
                {/* First row - 2 items with proper spacing */}
                <View style={{ 
                  flexDirection: "row", 
                  justifyContent: "space-between", 
                  marginBottom: 12,
                  gap: 12,
                }}>
                  {agendaData?.todays_agenda?.slice(0, 2).map((item: AgendaItem, index: number) => (
                    <View key={item.id} style={{ 
                      flex: index === 0 ? 2 : 1,
                    }}>
                      <TouchableOpacity onPress={() => handleActivityPress(item)}>
                        <View style={{
                          height: 128,
                          borderRadius: 16,
                          overflow: 'hidden',
                        }}>
                          <ImageBackground
                            source={{ uri: item.thumbnail_url || require('../../../assets/images/mindful.jpeg') }}
                            style={{
                              flex: 1,
                              justifyContent: "flex-end",
                              padding: 12,
                            }}
                            imageStyle={{ borderRadius: 16 }}
                          >
                            {/* Blue filter */}
                            <View
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: getContentTypeColor(item.content_type),
                              }}
                            />
                            {/* Content */}
                            <View style={{ zIndex: 1 }}>
                              {/* Content type indicator */}
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Ionicons 
                                  name={getContentTypeIcon(item.content_type) as any} 
                                  size={14} 
                                  color="white" 
                                />
                                <Text style={{ 
                                  color: "white", 
                                  fontSize: 9, 
                                  marginLeft: 4, 
                                  textTransform: 'capitalize', 
                                  fontWeight: '500' 
                                }}>
                                  {safeText(item.content_type.replace('_', ' '))}
                                </Text>
                              </View>
                              {/* Main title */}
                              <Text
                                style={{
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: 16,
                                  marginBottom: 4,
                                  textShadowColor: 'rgba(0, 0, 0, 0.5)',
                                  textShadowOffset: { width: 0, height: 1 },
                                  textShadowRadius: 2,
                                }}
                                numberOfLines={2}
                              >
                                {safeText(item.title)}
                              </Text>
                              {/* Description */}
                              <Text style={{ 
                                color: "white", 
                                fontSize: 10, 
                                lineHeight: 14, 
                                textShadowColor: 'rgba(0, 0, 0, 0.3)', 
                                textShadowOffset: { width: 0, height: 1 } 
                              }}
                              numberOfLines={2}
                              >
                                {safeText(item.reason)}
                              </Text>
                            </View>
                          </ImageBackground>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Second row - 2 items with equal width and proper spacing */}
                {agendaData && agendaData.todays_agenda && agendaData.todays_agenda.length > 2 && (
                  <View style={{ 
                    flexDirection: "row", 
                    justifyContent: "space-between",
                    gap: 12,
                  }}>
                    {agendaData?.todays_agenda?.slice(2, 4).map((item: AgendaItem) => (
                      <View key={item.id} style={{ flex: 1 }}>
                        <TouchableOpacity onPress={() => handleActivityPress(item)}>
                          <View style={{
                            height: 128,
                            borderRadius: 16,
                            overflow: 'hidden',
                          }}>
                            <ImageBackground
                              source={{ uri: item.thumbnail_url || require('../../../assets/images/reflection.jpeg') }}
                              style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 12,
                              }}
                              imageStyle={{ borderRadius: 16 }}
                            >
                              {/* Blue filter */}
                              <View
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: getContentTypeColor(item.content_type),
                                }}
                              />
                              {/* Content */}
                              <View style={{ zIndex: 1, alignItems: 'center' }}>
                                {/* Content type indicator */}
                                <View style={{ alignItems: 'center', marginBottom: 6 }}>
                                  <Ionicons 
                                    name={getContentTypeIcon(item.content_type) as any} 
                                    size={18} 
                                    color="white" 
                                    style={{ marginBottom: 4 }}
                                  />
                                  <Text style={{ 
                                    color: "white", 
                                    fontSize: 9, 
                                    textTransform: 'capitalize', 
                                    fontWeight: '500', 
                                    marginBottom: 4 
                                  }}>
                                    {safeText(item.content_type.replace('_', ' '))}
                                  </Text>
                                </View>
                                {/* Main title */}
                                <Text
                                  style={{
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: 14,
                                    textAlign: "center",
                                    marginBottom: 4,
                                    textShadowColor: 'rgba(0, 0, 0, 0.5)',
                                    textShadowOffset: { width: 0, height: 1 },
                                    textShadowRadius: 2,
                                  }}
                                  numberOfLines={2}
                                >
                                  {safeText(item.title)}
                                </Text>
                                {/* Description */}
                                <Text style={{ 
                                  color: "white", 
                                  fontSize: 9, 
                                  textAlign: "center", 
                                  lineHeight: 11, 
                                  textShadowColor: 'rgba(0, 0, 0, 0.3)', 
                                  textShadowOffset: { width: 0, height: 1 } 
                                }}
                                numberOfLines={3}
                                >
                                  {safeText(item.reason)}
                                </Text>
                              </View>
                            </ImageBackground>
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={{ alignItems: 'center', padding: 40, backgroundColor: '#f8fafc', borderRadius: 16 }}>
                <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
                <Text style={{ marginTop: 16, color: '#64748b', textAlign: 'center' }}>
                  No agenda items for today.{'\n'}Check back later for personalized recommendations!
                </Text>
              </View>
            )}

            {/* Progress Summary */}
            {agendaData?.progress_summary && (
              <View
                style={{
                  backgroundColor: "#f0f9ff",
                  borderRadius: 16,
                  padding: 16,
                  marginTop: 20,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: "#0f172a",
                    fontWeight: "bold",
                    fontSize: 16,
                    marginBottom: 8,
                  }}
                >
                  Progress Summary
                </Text>
                <Text style={{ color: "#1e293b", fontSize: 14, lineHeight: 20 }}>
                  {safeText(agendaData.progress_summary.next_milestone)}
                </Text>
              </View>
            )}
          </View>

          {/* Activities */}
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#0f172a",
                marginBottom: 20,
              }}
            >
              {user?.goals && user.goals.length > 0 ? 'Your Personalized Activities' : 'Activities'}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              {getPersonalizedActivities().map((activity, index) => (
                <View key={index} style={{ flex: 1, minWidth: "48%" }}>
                  <TouchableOpacity>
                    <View style={{
                      height: 128,
                      borderRadius: 16,
                      overflow: 'hidden',
                    }}>
                      <ImageBackground
                        source={activityBackgroundImages[index % activityBackgroundImages.length]}
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          padding: 12,
                        }}
                        imageStyle={{ borderRadius: 16 }}
                      >
                        {/* Blue filter */}
                        <View
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: getContentTypeColor('learning_module'),
                          }}
                        />
                        {/* Content */}
                        <View style={{ zIndex: 1, alignItems: 'center' }}>
                          <Text
                            style={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: 16,
                              textAlign: "center",
                              textShadowColor: 'rgba(0, 0, 0, 0.5)',
                              textShadowOffset: { width: 0, height: 1 },
                              textShadowRadius: 2,
                            }}
                            numberOfLines={2}
                          >
                            {safeText(activity)}
                          </Text>
                        </View>
                      </ImageBackground>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                backgroundColor: "#4f46e5",
                borderRadius: 999,
                marginTop: 16,
              }}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text
                style={{ color: "white", fontWeight: "bold", marginLeft: 8 }}
              >
                Add activity
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}