import Skeleton from '@/components/Skeleton';
import api from '@/constants/api';
import { useAuthStore } from '@/store/useAuthStore';
import { getImageUrl } from '@/utils/image';
import { Audio, AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bookmark, Eye, ShoppingBag } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Refactored ReelItem based on user snippet logic
const ReelItem = memo(({ item, isActive, isFocused, handleSave }: { item: any, isActive: boolean, isFocused: boolean, handleSave: (item: any) => void }) => {
  const router = useRouter();
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>({} as AVPlaybackStatus);
  const [isMuted, setIsMuted] = useState(false);
  const shouldPlay = isActive && isFocused;

  // Imperative Playback Logic from Snippet
  useEffect(() => {
    if (shouldPlay) {
      video.current?.playAsync().catch(async (err) => {
        if (err.message.includes('AudioFocusNotAcquiredException')) {
          // Fallback: Mute and try again
          setIsMuted(true);
          await video.current?.setIsMutedAsync(true);
          await video.current?.playAsync().catch(e => { });
        }
      });
    } else {
      video.current?.pauseAsync();
      // Reset position when inactive logic from snippet
      // Check if loaded to avoid errors
      if (status.isLoaded && status.positionMillis > 0) {
        video.current?.setPositionAsync(0).catch(err => { });
      }
    }
  }, [shouldPlay]); // Depend on the combined active+focused state

  const togglePlay = async () => {
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await video.current?.pauseAsync();
    } else {
      await video.current?.playAsync().catch(async (err) => {
        if (err.message.includes('AudioFocusNotAcquiredException')) {
          setIsMuted(true);
          await video.current?.setIsMutedAsync(true);
          await video.current?.playAsync();
        }
      });
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <View style={{ width, height, backgroundColor: 'black', position: 'relative' }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePlay}
        style={styles.videoContainer}
      >
        <Video
          ref={video}
          source={{ uri: getImageUrl(item.video) }}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={shouldPlay} // Declarative prop as backup
          isMuted={isMuted}
          useNativeControls={false}
          onPlaybackStatusUpdate={status => setStatus(status)}
        />

      </TouchableOpacity>

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Right Side Actions */}
      <View style={[styles.rightActions, { bottom: 220 }]}>
        <View style={styles.actionButton}>
          <Eye color="#FFF" size={28} />
          <Text style={styles.actionText}>{item.views}</Text>
        </View>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleSave(item)}>
          <Bookmark
            color={item.is_saved ? '#FF4500' : '#FFF'}
            size={28}
            fill={item.is_saved ? '#FF4500' : 'transparent'}
          />
          <Text style={styles.actionText}>{item.is_saved ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={[styles.bottomInfo, { paddingBottom: 110 }]}>
        <Text style={styles.caption}>{item.caption}</Text>

        {/* Product Card */}
        {item.product_details && (
          <View style={styles.productCard}>
            <Image
              source={{ uri: getImageUrl(item.product_details.image) }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{item.product_details.name}</Text>
              <Text style={styles.productPrice}>KSh {item.product_details.price}</Text>
            </View>
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => router.push(`/product/${item.product}` as any)}
            >
              <Text style={styles.orderButtonText}>Order from {item.restaurant_data?.name || 'Restaurant'}</Text>
              <ShoppingBag size={16} color="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
});

export default function ReelsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [reels, setReels] = useState<any[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Refresh reels when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      // We don't force refresh here to avoid resetting list on simple tab switch if data exists
      // But we can check if empty
      if (reels.length === 0) {
        fetchReels();
      }

      return () => {
        setIsFocused(false);
      };
    }, [reels.length])
  );

  useEffect(() => {
    // Configure Audio session specifically for video playback
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });
      } catch (error) {
        // ignore
      }
      fetchReels();
    };
    configureAudio();
  }, []);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchReels = async () => {
    try {
      const response = await api.get('/reels/');
      // Randomize reels to give a "fresh" feel on every pull-to-refresh
      setReels(shuffleArray(response.data));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setReels([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReels();
  }, []);

  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null) {
        setCurrentReelIndex(index);
        // Increment view count
        const reelId = viewableItems[0].item.id;
        api.post(`/reels/${reelId}/view/`).catch((err) => { });
      }
    }
  }).current;

  const handleSave = useCallback(async (reel: any) => {
    if (!user) {
      router.push('/auth/login' as any);
      return;
    }
    try {
      await api.post(`/reels/${reel.id}/toggle_save/`);
      // Optimistic update
      setReels(prev => prev.map(r =>
        r.id === reel.id ? { ...r, is_saved: !r.is_saved } : r
      ));
    } catch (error) {
      // ignore
    }
  }, [user, router]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    return (
      <ReelItem
        item={item}
        isActive={index === currentReelIndex}
        isFocused={isFocused}
        handleSave={handleSave}
      />
    );
  }, [currentReelIndex, isFocused, handleSave]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingHorizontal: 20 }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Skeleton width={width} height={height} />
          <View style={{ position: 'absolute', bottom: 100, left: 20, right: 20 }}>
            <Skeleton width={200} height={20} style={{ marginBottom: 15 }} />
            <Skeleton width="100%" height={80} style={{ borderRadius: 15 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFF"
            title="Pull to refresh"
            titleColor="#FFF"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
  },
  centerIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
    zIndex: 5,
  },
  muteButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 24,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  rightActions: {
    position: 'absolute',
    right: 15,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 25,
  },
  actionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  caption: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#FF4500',
    fontWeight: 'bold',
  },
  orderButton: {
    flexDirection: 'row',
    backgroundColor: '#FF4500',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
