import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/AuthGuard';

interface Plan {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: string;
  isActive: boolean;
  progress: number;
}

export default function PlansScreen() {
  return <PlansScreenContent />;
}

function PlansScreenContent() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    category: 'wellness',
    duration: '7 days',
    difficulty: 'beginner',
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    // Mock data for now - replace with API call when ready
    const mockPlans: Plan[] = [
      {
        id: 1,
        title: '7-Day Mindfulness Challenge',
        description: 'Build a daily mindfulness practice with guided meditations and breathing exercises.',
        category: 'mindfulness',
        duration: '7 days',
        difficulty: 'beginner',
        isActive: true,
        progress: 75,
      },
      {
        id: 2,
        title: 'Sleep Improvement Plan',
        description: 'Establish healthy sleep habits and create a relaxing bedtime routine.',
        category: 'sleep',
        duration: '14 days',
        difficulty: 'intermediate',
        isActive: false,
        progress: 0,
      },
      {
        id: 3,
        title: 'Stress Management Program',
        description: 'Learn techniques to manage stress and build resilience.',
        category: 'stress',
        duration: '21 days',
        difficulty: 'intermediate',
        isActive: false,
        progress: 0,
      },
    ];
    setPlans(mockPlans);
  };

  const handleCreatePlan = () => {
    if (!newPlan.title || !newPlan.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const plan: Plan = {
      id: Date.now(),
      title: newPlan.title,
      description: newPlan.description,
      category: newPlan.category,
      duration: newPlan.duration,
      difficulty: newPlan.difficulty,
      isActive: false,
      progress: 0,
    };

    setPlans([...plans, plan]);
    setNewPlan({
      title: '',
      description: '',
      category: 'wellness',
      duration: '7 days',
      difficulty: 'beginner',
    });
    setShowCreateModal(false);
    Alert.alert('Success', 'Plan created successfully!');
  };

  const togglePlan = (planId: number) => {
    setPlans(plans.map(plan => 
      plan.id === planId 
        ? { ...plan, isActive: !plan.isActive }
        : plan
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mindfulness':
        return 'leaf';
      case 'sleep':
        return 'moon';
      case 'stress':
        return 'heart';
      case 'wellness':
        return 'fitness';
      default:
        return 'star';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981'; // green-500
      case 'intermediate':
        return '#f59e0b'; // amber-500
      case 'advanced':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0ffff' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 }}>
              Wellness Plans
            </Text>
            <Text style={{ fontSize: 16, color: '#64748b', lineHeight: 24 }}>
              Choose from personalized plans or create your own wellness journey
            </Text>
          </View>

          {/* Create Plan Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#0d9488',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Create New Plan
            </Text>
          </TouchableOpacity>

          {/* Plans List */}
          <View style={{ gap: 16 }}>
            {plans.map((plan) => (
              <View
                key={plan.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: plan.isActive ? '#0d9488' : '#e2e8f0',
                }}
              >
                {/* Plan Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      backgroundColor: plan.isActive ? '#0d9488' : '#f1f5f9',
                      borderRadius: 12,
                      padding: 12,
                      marginRight: 16,
                    }}
                  >
                    <Ionicons
                      name={getCategoryIcon(plan.category) as any}
                      size={24}
                      color={plan.isActive ? 'white' : '#64748b'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 4 }}>
                      {plan.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={16} color="#64748b" />
                        <Text style={{ marginLeft: 4, color: '#64748b', fontSize: 14 }}>
                          {plan.duration}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: getDifficultyColor(plan.difficulty),
                            marginRight: 4,
                          }}
                        />
                        <Text style={{ color: '#64748b', fontSize: 14, textTransform: 'capitalize' }}>
                          {plan.difficulty}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Plan Description */}
                <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16 }}>
                  {plan.description}
                </Text>

                {/* Progress Bar */}
                {plan.isActive && (
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, color: '#64748b' }}>Progress</Text>
                      <Text style={{ fontSize: 14, color: '#0d9488', fontWeight: '600' }}>
                        {plan.progress}%
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: '#e2e8f0',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          backgroundColor: '#0d9488',
                          width: `${plan.progress}%`,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: plan.isActive ? '#fef2f2' : '#0d9488',
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                    }}
                    onPress={() => togglePlan(plan.id)}
                  >
                    <Text
                      style={{
                        color: plan.isActive ? '#dc2626' : 'white',
                        fontWeight: '600',
                        fontSize: 14,
                      }}
                    >
                      {plan.isActive ? 'Pause Plan' : 'Start Plan'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#f1f5f9',
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                    }}
                    onPress={() => Alert.alert('Coming Soon', 'Plan details will be available soon!')}
                  >
                    <Ionicons name="eye-outline" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Plan Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <View style={{ padding: 20 }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={{ marginRight: 16 }}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: '600', color: '#0f172a' }}>
                Create New Plan
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 20 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Plan Title
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  placeholder="Enter plan title"
                  value={newPlan.title}
                  onChangeText={(text) => setNewPlan({ ...newPlan, title: text })}
                />
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Description
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    height: 80,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Describe your plan"
                  multiline
                  value={newPlan.description}
                  onChangeText={(text) => setNewPlan({ ...newPlan, description: text })}
                />
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Category
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['wellness', 'mindfulness', 'sleep', 'stress'].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: newPlan.category === category ? '#0d9488' : '#f1f5f9',
                      }}
                      onPress={() => setNewPlan({ ...newPlan, category })}
                    >
                      <Text
                        style={{
                          color: newPlan.category === category ? 'white' : '#64748b',
                          fontSize: 14,
                          textTransform: 'capitalize',
                        }}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Duration
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {['7 days', '14 days', '21 days', '30 days'].map((duration) => (
                      <TouchableOpacity
                        key={duration}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: newPlan.duration === duration ? '#0d9488' : '#f1f5f9',
                        }}
                        onPress={() => setNewPlan({ ...newPlan, duration })}
                      >
                        <Text
                          style={{
                            color: newPlan.duration === duration ? 'white' : '#64748b',
                            fontSize: 12,
                          }}
                        >
                          {duration}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Difficulty
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: newPlan.difficulty === difficulty ? '#0d9488' : '#f1f5f9',
                      }}
                      onPress={() => setNewPlan({ ...newPlan, difficulty })}
                    >
                      <Text
                        style={{
                          color: newPlan.difficulty === difficulty ? 'white' : '#64748b',
                          fontSize: 14,
                          textTransform: 'capitalize',
                        }}
                      >
                        {difficulty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#0d9488',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginTop: 32,
              }}
              onPress={handleCreatePlan}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Create Plan
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
