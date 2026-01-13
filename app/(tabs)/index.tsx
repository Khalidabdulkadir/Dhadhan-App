import Skeleton from '@/components/Skeleton';
import api, { BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/useAuthStore';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Eye, Heart, ShoppingBag } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

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

  // Refresh reels when screen comes into focus (tab clicked)
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setRefreshing(true); // Show pull-to-refresh animation
      fetchReels(); // Refresh data when user navigates to this tab

      return () => {
        setIsFocused(false); // Stop videos when navigating away
      };
    }, [])
  );

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await api.get('/reels/');
      setReels(response.data);
    } catch (error: any) {
      console.error('Error fetching reels:', error);
      // If 404, it means no reels exist yet - set empty array
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
        api.post(`/reels/${reelId}/view/`).catch(console.error);
      }
    }
  }).current;

  const handleSave = async (reel: any) => {
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
      console.error('Error saving reel:', error);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isActive = index === currentReelIndex;

    return (
      <View style={{ width, height }}>
        <Video
          source={{ uri: getImageUrl(item.video) }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={isActive && isFocused}
          isMuted={false}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        {/* Right Side Actions - TikTok Style */}
        <View style={[styles.rightActions, { bottom: 180 }]}>
          <View style={styles.actionButton}>
            <Eye color="#FFF" size={28} />
            <Text style={styles.actionText}>{item.views}</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSave(item)}>
            <Heart
              color={item.is_saved ? '#FF4500' : '#FFF'}
              size={28}
              fill={item.is_saved ? '#FF4500' : 'transparent'}
            />
            <Text style={styles.actionText}>{item.is_saved ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={[styles.bottomInfo, { paddingBottom: 100 }]}>
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
  }, [currentReelIndex, isFocused, getImageUrl]);

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
      <StatusBar style="light" backgroundColor="transparent" translucent={true} hidden={false} />
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
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
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
