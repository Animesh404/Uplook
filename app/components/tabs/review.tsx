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

interface Review {
  id: number;
  title: string;
  content: string;
  rating: number;
  category: string;
  date: string;
  isPublic: boolean;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  categories: { [key: string]: number };
  recentActivity: string;
}

export default function ReviewScreen() {
  return <ReviewScreenContent />;
}

function ReviewScreenContent() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    categories: {},
    recentActivity: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReview, setNewReview] = useState({
    title: '',
    content: '',
    rating: 5,
    category: 'wellness',
    isPublic: true,
  });

  useEffect(() => {
    loadReviews();
    loadStats();
  }, []);

  const loadReviews = () => {
    // Mock data for now - replace with API call when ready
    const mockReviews: Review[] = [
      {
        id: 1,
        title: 'Amazing Meditation Experience',
        content: 'This meditation session completely transformed my morning routine. I feel more centered and focused throughout the day. Highly recommend for anyone looking to start their mindfulness journey.',
        rating: 5,
        category: 'meditation',
        date: '2025-08-14',
        isPublic: true,
      },
      {
        id: 2,
        title: 'Great Sleep Improvement Tips',
        content: 'The sleep hygiene module provided practical strategies that actually work. I\'ve been sleeping better and feeling more rested in the mornings.',
        rating: 4,
        category: 'sleep',
        date: '2025-08-12',
        isPublic: true,
      },
      {
        id: 3,
        title: 'Stress Management Techniques',
        content: 'The breathing exercises and stress management content helped me during a particularly challenging week at work. Simple but effective techniques.',
        rating: 5,
        category: 'stress',
        date: '2025-08-10',
        isPublic: false,
      },
    ];
    setReviews(mockReviews);
  };

  const loadStats = () => {
    const mockStats: ReviewStats = {
      totalReviews: 3,
      averageRating: 4.7,
      categories: {
        meditation: 1,
        sleep: 1,
        stress: 1,
      },
      recentActivity: '2 days ago',
    };
    setStats(mockStats);
  };

  const handleCreateReview = () => {
    if (!newReview.title || !newReview.content) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const review: Review = {
      id: Date.now(),
      title: newReview.title,
      content: newReview.content,
      rating: newReview.rating,
      category: newReview.category,
      date: new Date().toISOString().split('T')[0],
      isPublic: newReview.isPublic,
    };

    setReviews([review, ...reviews]);
    setNewReview({
      title: '',
      content: '',
      rating: 5,
      category: 'wellness',
      isPublic: true,
    });
    setShowCreateModal(false);
    Alert.alert('Success', 'Review created successfully!');
  };

  const deleteReview = (reviewId: number) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setReviews(reviews.filter(review => review.id !== reviewId));
            Alert.alert('Success', 'Review deleted successfully!');
          },
        },
      ]
    );
  };

  const toggleReviewVisibility = (reviewId: number) => {
    setReviews(reviews.map(review =>
      review.id === reviewId
        ? { ...review, isPublic: !review.isPublic }
        : review
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meditation':
        return 'leaf';
      case 'sleep':
        return 'moon';
      case 'stress':
        return 'heart';
      case 'wellness':
        return 'fitness';
      case 'anxiety':
        return 'cloud';
      default:
        return 'star';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </View>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meditation':
        return '#10b981'; // green-500
      case 'sleep':
        return '#8b5cf6'; // violet-500
      case 'stress':
        return '#f59e0b'; // amber-500
      case 'wellness':
        return '#0d9488'; // teal-600
      case 'anxiety':
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
              My Reviews
            </Text>
            <Text style={{ fontSize: 16, color: '#64748b', lineHeight: 24 }}>
              Share your experiences and track your wellness journey
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0d9488' }}>
                {stats.totalReviews}
              </Text>
              <Text style={{ fontSize: 14, color: '#64748b' }}>Total Reviews</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fbbf24' }}>
                {stats.averageRating.toFixed(1)}
              </Text>
              <Text style={{ fontSize: 14, color: '#64748b' }}>Avg Rating</Text>
            </View>
          </View>

          {/* Create Review Button */}
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
            <Ionicons name="create-outline" size={24} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              Write a Review
            </Text>
          </TouchableOpacity>

          {/* Reviews List */}
          <View style={{ gap: 16 }}>
            {reviews.map((review) => (
              <View
                key={review.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: getCategoryColor(review.category),
                }}
              >
                {/* Review Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      backgroundColor: getCategoryColor(review.category),
                      borderRadius: 12,
                      padding: 12,
                      marginRight: 16,
                    }}
                  >
                    <Ionicons
                      name={getCategoryIcon(review.category) as any}
                      size={24}
                      color="white"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 4 }}>
                      {review.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                      {renderStars(review.rating)}
                      <Text style={{ color: '#64748b', fontSize: 14 }}>
                        {review.date}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons
                          name={review.isPublic ? 'globe-outline' : 'lock-closed-outline'}
                          size={16}
                          color="#64748b"
                        />
                        <Text style={{ marginLeft: 4, color: '#64748b', fontSize: 12 }}>
                          {review.isPublic ? 'Public' : 'Private'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Review Content */}
                <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 16 }}>
                  {review.content}
                </Text>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#f1f5f9',
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                    }}
                    onPress={() => toggleReviewVisibility(review.id)}
                  >
                    <Text style={{ color: '#64748b', fontWeight: '600', fontSize: 14 }}>
                      {review.isPublic ? 'Make Private' : 'Make Public'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#fef2f2',
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                    }}
                    onPress={() => deleteReview(review.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Empty State */}
          {reviews.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="chatbubble-outline" size={64} color="#d1d5db" />
              <Text style={{ fontSize: 18, color: '#64748b', marginTop: 16, marginBottom: 8 }}>
                No reviews yet
              </Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center' }}>
                Start sharing your wellness experiences by writing your first review
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Review Modal */}
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
                Write a Review
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 20 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Review Title
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  placeholder="Give your review a title"
                  value={newReview.title}
                  onChangeText={(text) => setNewReview({ ...newReview, title: text })}
                />
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Your Experience
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    height: 100,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Share your experience and thoughts..."
                  multiline
                  value={newReview.content}
                  onChangeText={(text) => setNewReview({ ...newReview, content: text })}
                />
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Rating
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Ionicons
                        name={star <= newReview.rating ? 'star' : 'star-outline'}
                        size={32}
                        color={star <= newReview.rating ? '#fbbf24' : '#d1d5db'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                  Category
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['wellness', 'meditation', 'sleep', 'stress', 'anxiety'].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: newReview.category === category ? '#0d9488' : '#f1f5f9',
                      }}
                      onPress={() => setNewReview({ ...newReview, category })}
                    >
                      <Text
                        style={{
                          color: newReview.category === category ? 'white' : '#64748b',
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

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                  onPress={() => setNewReview({ ...newReview, isPublic: !newReview.isPublic })}
                >
                  <Ionicons
                    name={newReview.isPublic ? 'globe-outline' : 'lock-closed-outline'}
                    size={20}
                    color={newReview.isPublic ? '#0d9488' : '#64748b'}
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: newReview.isPublic ? '#0d9488' : '#64748b',
                      fontSize: 14,
                    }}
                  >
                    {newReview.isPublic ? 'Public Review' : 'Private Review'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#0d9488',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginTop: 32,
              }}
              onPress={handleCreateReview}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Submit Review
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
