import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
const validIcons = new Set(Object.keys(Ionicons.glyphMap)); // Get all valid icon names
import Logo from "./components/Logo";
import Button from "./components/Button";

type PlanItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function ResultsScreen() {
  const planItems: PlanItem[] = [
    { id: "1", label: "Learning modules for improvement", icon: "book" },
    { id: "2", label: "Daily meditations", icon: "leaf" },
    { id: "3", label: "Daily reflection quizzes and journal", icon: "create" },
    { id: "4", label: "Video coach lessons", icon: "videocam" },
    {
      id: "5",
      label: "Spoken word and music for your mind improvement",
      icon: "musical-notes",
    },
    { id: "6", label: "Customer support", icon: "chatbubble-ellipses" },
  ];

  const personalSummaryItems = [
    { id: "1", label: "Lack of self-trust", icon: "shield" },
    { id: "2", label: "Fear of rejection", icon: "people" },
    { id: "3", label: "Being too critical", icon: "alert-circle" },
    { id: "4", label: "Comparing to others", icon: "git-compare" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="px-6 pt-4 pb-8">
          <View className="flex-row items-center justify-center w-full mb-6">
            <Logo size="small" />
            <Text className="ml-2 text-teal-600 font-medium">Uplook</Text>
          </View>

          <View className="bg-teal-100 rounded-xl p-6 mb-6">
            <Text className="text-xl font-bold text-blue-900 mb-4 text-center">
              Based on your answers, we prepared a self-improvement plan for you
            </Text>

            {/* Growth potential graph */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-blue-900 mb-1">
                Your growth potential graph
              </Text>
              <Text className="text-xs text-blue-800 mb-3">
                Time x Self-esteem level
              </Text>

              <View className="flex-row justify-between items-end h-32 bg-teal-50 rounded-lg p-4">
                <View className="items-center">
                  <View className="w-8 bg-indigo-500 h-8 mb-2 rounded" />
                  <Text className="text-xs text-blue-900">Today</Text>
                </View>

                <View className="items-center">
                  <View className="w-8 bg-indigo-500 h-20 mb-2 rounded" />
                  <Text className="text-xs text-blue-900">1 month</Text>
                </View>

                <View className="items-center">
                  <View className="w-8 bg-indigo-500 h-28 mb-2 rounded" />
                  <Text className="text-xs text-blue-900">2 months</Text>
                </View>
              </View>
            </View>

            {/* Personal summary */}
            <Text className="text-sm font-semibold text-blue-900 mb-3">
              Your personal summary
            </Text>

            <View className="flex-row flex-wrap justify-between mb-6">
              {personalSummaryItems.map((item) => (
                <View
                  key={item.id}
                  className="w-[48%] bg-teal-50 rounded-lg p-3 mb-3"
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-2">
                      <Ionicons
                        name={
                          validIcons.has(item.icon)
                            ? (item.icon as keyof typeof Ionicons.glyphMap)
                            : "alert"
                        } // Fallback to a default icon
                        size={16}
                        color="#0d9488"
                      />
                    </View>
                    <Text className="text-xs font-medium text-blue-900 flex-1">
                      {item.label}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Analysis text */}
            <Text className="text-sm text-blue-900 mb-4">
              You struggle with low self-esteem, fearing rejection and doubting
              your worth. Trusting your own judgment is difficult as you
              constantly seek validation from others.
            </Text>

            <Text className="text-sm text-blue-900 mb-6">
              As your coach, I'll help you build confidence by reinforcing
              positive self-image. Building self-esteem and challenging negative
              self-talk are essential for your growth and well-being.
            </Text>

            {/* Plan includes */}
            <Text className="text-sm font-semibold text-blue-900 mb-3">
              Your plan includes
            </Text>

            <View className="mb-6">
              {planItems.map((item) => (
                <View key={item.id} className="flex-row items-center mb-3">
                  <View className="w-6 h-6 rounded-full bg-teal-200 items-center justify-center mr-3">
                    <Ionicons name={item.icon} size={14} color="#0d9488" />
                  </View>
                  <Text className="text-sm text-blue-900 flex-1">
                    {item.label}
                  </Text>
                  {item.id === "6" && (
                    <View className="bg-teal-200 rounded-full px-2 py-1">
                      <Text className="text-xs text-teal-700">Chat</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <Button
              label="Start today"
              onPress={() => router.replace("/home" as any)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
