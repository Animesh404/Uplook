import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import Logo from "../components/Logo";
import ChatModal from "../components/ChatModal";
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '@clerk/clerk-expo';

const Screen = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0ffff" }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
};

export default function HomeScreen() {
  const [isChatModalVisible, setIsChatModalVisible] = React.useState(false);
  const { user } = useAuth();
  const { user: clerkUser } = useUser();

  // Get user's first name
  const getUserFirstName = () => {
    const fullName = user?.fullName || clerkUser?.fullName || '';
    return fullName.split(' ')[0] || 'there';
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current date
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Get personalized activities based on user goals
  const getPersonalizedActivities = () => {
    const defaultActivities = [
      "Fill out gratitude journal",
      "Meditate",
      "Learning module",
      "Quiz",
    ];

    if (user?.goals && user.goals.length > 0) {
      // Create personalized activities based on user goals
      const personalizedActivities = user.goals.map(goal => {
        if (goal.toLowerCase().includes('meditation')) return 'Meditation session';
        if (goal.toLowerCase().includes('exercise') || goal.toLowerCase().includes('fitness')) return 'Quick workout';
        if (goal.toLowerCase().includes('sleep')) return 'Sleep hygiene check';
        if (goal.toLowerCase().includes('stress') || goal.toLowerCase().includes('anxiety')) return 'Stress relief';
        if (goal.toLowerCase().includes('gratitude')) return 'Gratitude practice';
        return `${goal} practice`;
      });

      // Combine personalized and default activities
      return [...personalizedActivities.slice(0, 2), ...defaultActivities.slice(0, 2)];
    }

    return defaultActivities;
  };

  // Get personalized message based on user goals
  const getPersonalizedMessage = () => {
    if (user?.goals && user.goals.length > 0) {
      const primaryGoal = user.goals[0];
      if (primaryGoal.toLowerCase().includes('meditation')) {
        return 'Take a moment to center yourself today!';
      } else if (primaryGoal.toLowerCase().includes('exercise')) {
        return 'Your body and mind will thank you for moving today!';
      } else if (primaryGoal.toLowerCase().includes('sleep')) {
        return 'Prioritize your rest and recovery today!';
      } else if (primaryGoal.toLowerCase().includes('stress')) {
        return 'Remember to breathe and stay present today!';
      }
    }
    return "You're one step closer to reaching your goals!";
  };

  return (
    <Screen>
      <ScrollView>
        <View style={{ padding: 24 }}>
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
              {getGreeting()}, {getUserFirstName()}!
            </Text>
            <Text style={{ color: "#1e293b", marginTop: 4 }}>
              {getPersonalizedMessage()}
            </Text>
            <View
              style={{
                backgroundColor: "#ebffff",
                borderRadius: 16,
                padding: 16,
                marginTop: 16,
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
          <View style={{ marginBottom: 24 }}>
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
              <Text style={{ fontSize: 14, color: "#475569" }}>{getCurrentDate()}</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ width: "65%" }}>
                <ImageBackground
                  source={{
                    uri: "https://images.unsplash.com/photo-1506126613408-4e0e0f7de58e?w=500",
                  }}
                  style={{
                    height: 128,
                    justifyContent: "flex-end",
                    padding: 12,
                  }}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    How to be mindful
                  </Text>
                  <Text style={{ color: "white", fontSize: 12 }}>
                    Learning course
                  </Text>
                </ImageBackground>
              </View>
              <View style={{ width: "32%" }}>
                <ImageBackground
                  source={{
                    uri: "https://images.unsplash.com/photo-1595147545958-5433ohned84d?w=500",
                  }}
                  style={{
                    height: 128,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 12,
                  }}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Sleepy music
                  </Text>
                </ImageBackground>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 12,
              }}
            >
              <View style={{ width: "48%" }}>
                <TouchableOpacity onPress={() => router.push('/journal')}>
                  <ImageBackground
                    source={{
                      uri: "https://images.unsplash.com/photo-1552234876-5fb207d2ce2F?w=500",
                    }}
                    style={{
                      height: 128,
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 12,
                    }}
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <Text
                      style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                    >
                      Journal & Reflection
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
              <View style={{ width: "48%" }}>
                <TouchableOpacity onPress={() => router.push('/content/video-1')}>
                  <ImageBackground
                    source={{
                      uri: "https://images.unsplash.com/photo-1544991936-9464b5343a4b?w=500",
                    }}
                    style={{
                      height: 128,
                      justifyContent: "space-between",
                      padding: 12,
                      flexDirection: "row",
                      alignItems: "flex-end",
                    }}
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <View>
                      <Text style={{ color: "white", fontSize: 12 }}>
                        Video coach
                      </Text>
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        Mindful Breathing
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.5)",
                        borderRadius: 999,
                        padding: 4,
                      }}
                    >
                      <Ionicons name="play" size={16} color="white" />
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Activities */}
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#0f172a",
                marginBottom: 16,
              }}
            >
              {user?.goals && user.goals.length > 0 ? 'Your Personalized Activities' : 'Activities'}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {getPersonalizedActivities().map((activity, index) => (
                <View key={index} style={{ width: "48%", marginBottom: 12 }}>
                  <ImageBackground
                    source={{
                      uri: `https://source.unsplash.com/featured/?nature,${index}`,
                    }}
                    style={{
                      height: 128,
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 12,
                    }}
                    imageStyle={{
                      borderRadius: 16,
                      opacity: 0.7,
                      backgroundColor: "#000",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                    >
                      {activity}
                    </Text>
                  </ImageBackground>
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
                marginTop: 12,
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
