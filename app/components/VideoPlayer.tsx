import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Video, ResizeMode } from 'expo-video';
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
  const [status, setStatus] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const video = useRef<Video>(null);

  const handlePlayPause = () => {
    if (status.isPlaying) {
      video.current?.pauseAsync();
    } else {
      video.current?.playAsync();
    }
  };

  const handlePlaybackStatusUpdate = (playbackStatus: any) => {
    setStatus(playbackStatus);
    setIsLoading(playbackStatus.isLoaded ? false : true);
    
    // Handle video completion
    if (playbackStatus.didJustFinish && onComplete) {
      onComplete();
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    video.current?.presentFullscreenPlayer();
  };

  return (
    <View className="bg-black rounded-xl overflow-hidden">
      {title && (
        <View className="p-4 bg-gray-900">
          <Text className="text-white font-semibold text-lg">{title}</Text>
        </View>
      )}
      
      <View style={{ height: width * 0.56 }} className="relative">
        <Video
          ref={video}
          source={{ uri: videoUrl }}
          style={{ flex: 1 }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={autoPlay}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          useNativeControls={false}
        />
        
        {/* Custom Controls Overlay */}
        <View className="absolute inset-0 justify-center items-center">
          {isLoading && (
            <View className="bg-black bg-opacity-50 p-4 rounded-full">
              <Ionicons name="hourglass" size={32} color="white" />
            </View>
          )}
          
          {!isLoading && !status.isPlaying && (
            <TouchableOpacity
              onPress={handlePlayPause}
              className="bg-black bg-opacity-50 p-4 rounded-full"
            >
              <Ionicons name="play" size={32} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Bottom Controls */}
        {status.isLoaded && (
          <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handlePlayPause}>
                <Ionicons 
                  name={status.isPlaying ? "pause" : "play"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <View className="flex-1 mx-4">
                <View className="bg-gray-600 h-1 rounded-full">
                  <View 
                    className="bg-teal-500 h-1 rounded-full"
                    style={{ 
                      width: `${(status.positionMillis / status.durationMillis) * 100}%` 
                    }}
                  />
                </View>
              </View>
              
              <Text className="text-white text-sm">
                {formatTime(status.positionMillis || 0)} / {formatTime(status.durationMillis || 0)}
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