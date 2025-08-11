
import { useState, useEffect } from "react"
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Platform, StatusBar } from "react-native"
import { router } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useUser } from "@clerk/clerk-expo"
import { useOnboarding } from "../contexts/OnboardingContext"
import { useAuth } from "../contexts/AuthContext"
import ProgressHeader from "../components/ProgressHeader"
import Button from "../components/Button"

export default function OnboardingOne() {
  const { user: clerkUser } = useUser()
  const { data, updateData } = useOnboarding()
  const { completeOnboarding, isSignedIn, user } = useAuth()
  const [fullName, setFullName] = useState(data.fullName)
  const [age, setAge] = useState(data.age)
  const [email, setEmail] = useState(data.email)
  const [agreeToTerms, setAgreeToTerms] = useState(data.agreeToTerms)

  const statusBarHeight = Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0

  useEffect(() => {
    if (clerkUser) {
      const clerkFullName = clerkUser.fullName || ""
      const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress || ""
      setFullName(clerkFullName || data.fullName)
      setEmail(clerkEmail || data.email)
    }
  }, [clerkUser])

  const handleContinue = () => {
    if (!agreeToTerms) return
    updateData({ fullName, age, email, agreeToTerms })
    router.push("/onboarding/two")
  }

  const handleSkip = () => {
    updateData({ fullName, age, email, agreeToTerms })
    router.push("/onboarding/two")
  }

  return (
    <View className="flex-1 bg-cyan-50 px-4">
      {/* Header */}
      <View style={{ paddingTop: Platform.OS === 'android' ? statusBarHeight + 16 : 16 }}>
        <ProgressHeader step={1} totalSteps={3} onBack={() => router.back()} />
      </View>

      {/* Bottom sheet style container */}
      <View className="flex-1 bg-teal-200 rounded-t-3xl overflow-hidden shadow-lg -mx-4">
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{ padding: 24 }}
        >
          <Text className="text-3xl font-bold text-blue-900 mb-2 text-center">Who are you?</Text>
          <Text className="text-blue-800 mb-8 text-center text-lg">Fill out your personal details</Text>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="font-semibold text-blue-900 mb-3 text-base">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              className="bg-cyan-50 rounded-2xl p-4 text-gray-800 shadow-sm"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Age */}
          <View className="mb-4">
            <Text className="font-semibold text-blue-900 mb-3 text-base">Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              keyboardType="number-pad"
              className="bg-cyan-50 rounded-2xl p-4 text-gray-800 shadow-sm"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Email */}
          <View className="mb-6">
            <Text className="font-semibold text-blue-900 mb-3 text-base">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-cyan-50 rounded-2xl p-4 text-gray-800 shadow-sm"
              placeholderTextColor="#9ca3af"
              editable={!clerkUser?.primaryEmailAddress?.emailAddress}
            />
          </View>

          {/* Terms */}
          <TouchableOpacity
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            className="flex-row items-center mb-8"
          >
            <View
              className={`w-6 h-6 rounded-lg border-2 mr-3 items-center justify-center shadow-sm ${
                agreeToTerms ? "bg-teal-500 border-teal-500" : "bg-white border-gray-300"
              }`}
            >
              {agreeToTerms && <Ionicons name="checkmark" size={14} color="white" />}
            </View>
            <Text className="text-blue-900 flex-1 text-base">
              I agree with the <Text className="text-teal-700 font-semibold">Terms and Conditions</Text>
            </Text>
          </TouchableOpacity>

          {/* Continue button */}
          <View className="mb-4">
            <Button label="Continue" onPress={handleContinue} />
          </View>

          {/* Skip button */}
          <TouchableOpacity
            className="bg-cyan-300/60 rounded-2xl py-4 px-6"
            onPress={handleSkip}
          >
            <Text className="text-center text-blue-900 font-semibold text-lg">Skip</Text>
          </TouchableOpacity>

          {/* Debug Info */}
          <View className="mt-6 p-4 bg-white/70 rounded-2xl">
            <Text className="text-sm text-gray-600 mb-2 font-semibold">Debug Info:</Text>
            <Text className="text-xs text-gray-500">Is Signed In: {isSignedIn ? "Yes" : "No"}</Text>
            <Text className="text-xs text-gray-500">Clerk User: {clerkUser?.id || "None"}</Text>
            <Text className="text-xs text-gray-500">Auth User: {user?.id || "None"}</Text>
            <Text className="text-xs text-gray-500">Name: {clerkUser?.fullName || "None"}</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}
