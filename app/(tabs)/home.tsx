
import Skeleton from '@/components/Skeleton';
import api, { BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronDown, Plus, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [restRes, prodRes, catRes] = await Promise.all([
        api.get('/restaurants/'),
        api.get('/products/'),
        api.get('/categories/')
      ]);

      setCategories(catRes.data);

      const popularBrandsList = restRes.data.filter((r: any) => r.is_popular);
      setBrands(popularBrandsList);

      const promotedProducts = prodRes.data.filter((p: any) => p.is_promoted);
      setPromotions(promotedProducts);

      const nonPromoted = prodRes.data.filter((p: any) => !p.is_promoted);
      setPopularItems(nonPromoted.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // ... render functions ...

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/(tabs)/menu')}>
      <View style={styles.categoryIconContainer}>
        <Image source={{ uri: getImageUrl(item.image) }} style={styles.categoryIcon} />
      </View>
      <Text style={styles.categoryLabel} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBrand = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.restaurantCard} onPress={() => router.push(`/restaurant/${item.id}`)}>
      <View style={styles.restaurantImageContainer}>
        <Image source={{ uri: getImageUrl(item.logo) }} style={styles.restaurantImage} />
        <View style={styles.restaurantOverlay}>
          <View style={styles.restaurantTag}>
            <Text style={styles.restaurantTagText}>20-30 min</Text>
          </View>
        </View>
      </View>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.restaurantMeta} numberOfLines={1}>Burger • American</Text>
      </View>
    </TouchableOpacity>
  );

  const renderPopularItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.dishCard} onPress={() => router.push(`/product/${item.id}`)}>
      <Image source={{ uri: getImageUrl(item.image) }} style={styles.dishImage} />
      <View style={styles.dishInfo}>
        <View style={styles.dishHeader}>
          <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.dishMeta} numberOfLines={1}>
            {item.restaurant_data?.name || 'Burger'} • 20 min
          </Text>
        </View>
        <View style={styles.dishFooter}>
          <Text style={styles.dishPrice}>KSh {item.price}</Text>
          <View style={styles.addBtn}>
            <Plus color="#111" size={16} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPromotion = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.featuredCard} onPress={() => router.push(`/product/${item.id}`)}>
      <Image source={{ uri: getImageUrl(item.image) }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredTag}>
          <Text style={styles.featuredTagText}>{item.discount_percentage}% OFF</Text>
        </View>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.featuredPriceRow}>
            <Text style={styles.featuredOldPrice}>KSh {item.price}</Text>
            <Text style={styles.featuredPrice}>KSh {item.discounted_price}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ... skeleton ...

  const renderSkeleton = () => (
    <View style={{ paddingTop: 20 }}>
      {/* Header Skeleton */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Skeleton width={120} height={35} style={{ borderRadius: 20 }} />
        </View>
        <Skeleton width={40} height={40} style={{ borderRadius: 20 }} />
      </View>

      {/* Categories Skeleton (Horizontal) */}
      <View style={{ marginBottom: 30, paddingLeft: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={{ alignItems: 'center', marginRight: 25 }}>
              <Skeleton width={75} height={75} style={{ borderRadius: 37.5, marginBottom: 10 }} />
              <Skeleton width={50} height={12} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Brands Skeleton (Small Cards) */}
      <View style={{ marginBottom: 25, paddingLeft: 20 }}>
        <Skeleton width={150} height={20} style={{ marginBottom: 15 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map(i => (
            <View key={i} style={{ marginRight: 15 }}>
              <Skeleton width={145} height={90} style={{ borderRadius: 12, marginBottom: 8 }} />
              <Skeleton width={100} height={15} style={{ marginBottom: 4 }} />
              <Skeleton width={80} height={12} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Hot Deals Skeleton (Featured Cards) */}
      <View style={{ marginBottom: 25, paddingLeft: 20 }}>
        <Skeleton width={120} height={20} style={{ marginBottom: 15 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2].map(i => (
            <View key={i} style={{ marginRight: 15 }}>
              <Skeleton width={220} height={260} style={{ borderRadius: 24 }} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Recommended Skeleton (Horizontal List) */}
      <View style={{ paddingHorizontal: 20 }}>
        <Skeleton width={180} height={20} style={{ marginBottom: 15 }} />
        {[1, 2, 3].map(i => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 15 }}>
            <Skeleton width={110} height={110} style={{ borderRadius: 12, marginRight: 15 }} />
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Skeleton width="60%" height={20} style={{ marginBottom: 8 }} />
              <Skeleton width="40%" height={15} style={{ marginBottom: 12 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width={60} height={20} />
                <Skeleton width={32} height={32} style={{ borderRadius: 16 }} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {renderSkeleton()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4500']} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.deliverText}>Deliver now</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>Home • Nairobi</Text>
              <ChevronDown size={14} color="#111" style={{ marginLeft: 4 }} />
            </View>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(tabs)/profile')}>
            <User color="#111" size={20} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.sectionNoMargin}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          />
        </View>

        {/* Popular Brands (Brands) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Brands</Text>
            <TouchableOpacity><ArrowRight size={20} color="#111" /></TouchableOpacity>
          </View>
          <FlatList
            data={brands}
            renderItem={renderBrand}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          />
        </View>

        {/* Featured Deals (Horizontal) */}
        {promotions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Hot Deals</Text>
            </View>
            <FlatList
              data={promotions}
              renderItem={renderPromotion}
              keyExtractor={item => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        )}

        {/* Popular Items (Vertical) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Recommended for you</Text>
          </View>
          {popularItems.map((item) => (
            <View key={item.id} style={{ marginBottom: 10, marginHorizontal: 16 }}>
              {renderPopularItem({ item })}
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Slightly off-white for premium feel
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  headerContent: {
    justifyContent: 'center',
  },
  deliverText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontWeight: '700',
    color: '#111',
    fontSize: 15,
  },
  profileBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  // Featured Card (Horizontal Scroll)
  featuredCard: {
    width: 220,
    height: 260,
    marginRight: 15,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)', // Lighter gradient
  },
  featuredTag: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#FF4500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredTagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  featuredContent: {
    // text shadow for readability
  },
  featuredName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  featuredPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredOldPrice: {
    color: '#E5E7EB',
    textDecorationLine: 'line-through',
    fontSize: 14,
    fontWeight: '500',
  },
  featuredPrice: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  section: {
    marginBottom: 8, // Aggressively reduced from 20
  },
  sectionNoMargin: {
    marginTop: 8,
    marginBottom: 12, // Reduced from 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16, // Aligned with list padding
    marginBottom: 4, // Reduced from 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  sectionHeading: {
    fontSize: 18, // Slightly smaller header to match tighter space
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingBottom: 4, // Reduced from 10
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
  },

  // CATEGORIES (Perfecr Circle)
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  categoryIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34, // Perfect circle
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    overflow: 'hidden', // Ensure image fills the circle
  },
  categoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Fill the circle completely
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  // RESTAURANT CARDS (Brands - Original Style)
  restaurantCard: {
    width: 145,
    marginRight: 15,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 5,
  },
  restaurantImageContainer: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // "Fit the design" - fill the container
  },
  restaurantOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  restaurantTag: {
    backgroundColor: '#FFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  restaurantTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#111',
  },
  restaurantInfo: {
    padding: 8,
  },
  restaurantTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
    textAlign: 'left',
  },
  restaurantMeta: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'left',
  },

  // PRODUCT CARDS (Full Width Overlay - Smaller)
  dishCard: {
    flexDirection: 'column',
    marginBottom: 15, // Less margin
    backgroundColor: '#FFF',
    borderRadius: 20, // Slightly less rounded
    height: 170, // Much smaller height
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  dishImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dishInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)', // Slightly darker for better text contrast
    height: '100%',
    justifyContent: 'flex-end',
  },
  dishHeader: {
    marginBottom: 4,
  },
  dishName: {
    fontSize: 18, // Smaller font
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dishMeta: {
    fontSize: 12, // Smaller meta
    color: '#E5E7EB',
    marginBottom: 6,
    fontWeight: '600',
  },
  dishFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dishPrice: {
    fontSize: 16, // Smaller price
    fontWeight: '800',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  addBtn: {
    backgroundColor: '#FFF',
    width: 32, // Smaller btn
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
