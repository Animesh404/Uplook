import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type VideoPlayerProps = {
  videoUrl: string;
  title?: string;
  onComplete?: () => void;
  autoPlay?: boolean;
};

export default function VideoPlayer({ 
  videoUrl, 
  title, 
  onComplete, 
  autoPlay = false 
}: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    if (autoPlay) {
      player.play();
    }
  });

  useEffect(() => {
    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    const statusSubscription = player.addListener('statusChange', (event) => {
      setIsLoading(event.status !== 'readyToPlay');
      if (event.status === 'readyToPlay') {
        setDuration(player.duration);
      }
    });

    const timeSubscription = player.addListener('timeUpdate', (event) => {
      setCurrentTime(event.currentTime);
      
      // Check if video is complete (within 0.1 seconds of duration)
      if (duration > 0 && event.currentTime >= duration - 0.1 && onComplete) {
        onComplete();
      }
    });

    return () => {
      subscription?.remove();
      statusSubscription?.remove();
      timeSubscription?.remove();
    };
  }, [player, duration, onComplete]);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    // Note: Fullscreen functionality may need to be implemented differently with expo-video
    // This is a placeholder for now
    console.log('Fullscreen requested');
  };

  return (
    <View className="bg-black rounded-xl overflow-hidden">
      {title && (
        <View className="p-4 bg-gray-900">
          <Text className="text-white font-semibold text-lg">{title}</Text>
        </View>
      )}
      
      <View style={{ height: width * 0.56 }} className="relative">
        <VideoView
          player={player}
          style={{ flex: 1 }}
          allowsFullscreen
          nativeControls={false}
        />
        
        {/* Custom Controls Overlay */}
        <View className="absolute inset-0 justify-center items-center">
          {isLoading && (
            <View className="bg-black bg-opacity-50 p-4 rounded-full">
              <Ionicons name="hourglass" size={32} color="white" />
            </View>
          )}
          
          {!isLoading && !isPlaying && (
            <TouchableOpacity
              onPress={handlePlayPause}
              className="bg-black bg-opacity-50 p-4 rounded-full"
            >
              <Ionicons name="play" size={32} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Bottom Controls */}
        {!isLoading && duration > 0 && (
          <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handlePlayPause}>
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <View className="flex-1 mx-4">
                <View className="bg-gray-600 h-1 rounded-full">
                  <View 
                    className="bg-teal-500 h-1 rounded-full"
                    style={{ 
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` 
                    }}
                  />
                </View>
              </View>
              
              <Text className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
              
              <TouchableOpacity onPress={handleFullscreen} className="ml-4">
                <Ionicons name="expand" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}