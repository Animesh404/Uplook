import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
};

type QuizData = {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
};

type QuizComponentProps = {
  quizData: QuizData;
  onComplete: (score: number, totalQuestions: number) => void;
  onClose?: () => void;
};

export default function QuizComponent({ quizData, onComplete, onClose }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  const selectedAnswer = selectedAnswers[currentQuestion.id];

  const handleOptionSelect = (optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
    setShowExplanation(false);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      Alert.alert('Please select an answer', 'You need to select an answer before continuing.');
      return;
    }

    if (currentQuestion.explanation && !showExplanation) {
      setShowExplanation(true);
      return;
    }

    if (isLastQuestion) {
      calculateResults();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    
    quizData.questions.forEach(question => {
      const selectedOptionId = selectedAnswers[question.id];
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
      if (selectedOption?.isCorrect) {
        correctAnswers++;
      }
    });

    setShowResults(true);
    onComplete(correctAnswers, quizData.questions.length);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'Excellent work! 🎉';
    if (percentage >= 60) return 'Good job! Keep learning! 👍';
    return 'Keep practicing! You\'ll improve! 💪';
  };

  if (showResults) {
    const score = Object.keys(selectedAnswers).reduce((acc, questionId) => {
      const question = quizData.questions.find(q => q.id === questionId);
      const selectedOptionId = selectedAnswers[questionId];
      const selectedOption = question?.options.find(opt => opt.id === selectedOptionId);
      return selectedOption?.isCorrect ? acc + 1 : acc;
    }, 0);

    return (
      <View className="flex-1 bg-white">
        <View className="p-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-2xl font-bold text-blue-900">Quiz Complete!</Text>
            {onClose && (
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#1e40af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Score Display */}
          <View className="bg-teal-50 rounded-xl p-6 mb-6 items-center">
            <View className="w-20 h-20 bg-teal-500 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">
                {Math.round((score / quizData.questions.length) * 100)}%
              </Text>
            </View>
            <Text className={`text-2xl font-bold mb-2 ${getScoreColor(score, quizData.questions.length)}`}>
              {score} / {quizData.questions.length}
            </Text>
            <Text className="text-blue-900 text-lg text-center">
              {getScoreMessage(score, quizData.questions.length)}
            </Text>
          </View>

          {/* Question Review */}
          <ScrollView className="flex-1">
            <Text className="text-lg font-semibold text-blue-900 mb-4">Review Your Answers</Text>
            {quizData.questions.map((question, index) => {
              const selectedOptionId = selectedAnswers[question.id];
              const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
              const correctOption = question.options.find(opt => opt.isCorrect);
              
              return (
                <View key={question.id} className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <Text className="font-semibold text-blue-900 mb-2">
                    {index + 1}. {question.question}
                  </Text>
                  <Text className={`mb-1 ${selectedOption?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    Your answer: {selectedOption?.text}
                  </Text>
                  {!selectedOption?.isCorrect && (
                    <Text className="text-green-600">
                      Correct answer: {correctOption?.text}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-blue-900">{quizData.title}</Text>
            <Text className="text-blue-700">
              Question {currentQuestionIndex + 1} of {quizData.questions.length}
            </Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1e40af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View className="bg-gray-200 h-2 rounded-full mb-8">
          <View 
            className="bg-teal-500 h-2 rounded-full"
            style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
          />
        </View>

        {/* Question */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-blue-900 mb-6">
            {currentQuestion.question}
          </Text>

          {/* Options */}
          <View className="space-y-3">
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => handleOptionSelect(option.id)}
                className={`p-4 rounded-xl border-2 ${
                  selectedAnswer === option.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                    selectedAnswer === option.id
                      ? 'border-teal-500 bg-teal-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswer === option.id && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text className={`flex-1 ${
                    selectedAnswer === option.id ? 'text-teal-700 font-medium' : 'text-gray-700'
                  }`}>
                    {option.text}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <View className="mb-6 p-4 bg-blue-50 rounded-xl">
            <Text className="text-blue-900 font-semibold mb-2">Explanation:</Text>
            <Text className="text-blue-800">{currentQuestion.explanation}</Text>
          </View>
        )}

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={!selectedAnswer}
          className={`p-4 rounded-xl items-center ${
            selectedAnswer 
              ? 'bg-teal-500' 
              : 'bg-gray-300'
          }`}
        >
          <Text className={`font-semibold text-lg ${
            selectedAnswer ? 'text-white' : 'text-gray-500'
          }`}>
            {showExplanation 
              ? (isLastQuestion ? 'Complete Quiz' : 'Next Question')
              : (currentQuestion.explanation ? 'Show Explanation' : (isLastQuestion ? 'Complete Quiz' : 'Next Question'))
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}