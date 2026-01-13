
import Skeleton from '@/components/Skeleton';
import api, { BASE_URL } from '@/constants/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, BadgeCheck, Plus, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
// Use full width for paging container, card will have internal margin
const CONTAINER_WIDTH = width;
const CARD_WIDTH = width - 32; // Actual visual card width

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [verifiedBrands, setVerifiedBrands] = useState<any[]>([]); // NEW
  const [campaignRestaurants, setCampaignRestaurants] = useState<any[]>([]);
  const [offerRestaurants, setOfferRestaurants] = useState<any[]>([]);
  const [offerProducts, setOfferProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const campaignListRef = React.useRef<FlatList>(null);
  const [activeCampaignIndex, setActiveCampaignIndex] = useState(0);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  // Auto-Scroll Effect
  useEffect(() => {
    if (campaignRestaurants.length <= 1) return;

    const intervalId = setInterval(() => {
      setActiveCampaignIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % campaignRestaurants.length;
        campaignListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000); // 4 seconds slide

    return () => clearInterval(intervalId);
  }, [campaignRestaurants]);

  const fetchData = async () => {
    try {
      const [restRes, prodRes, catRes] = await Promise.all([
        api.get('/restaurants/'),
        api.get('/products/'),
        api.get('/categories/')
      ]);

      setCategories(catRes.data);

      const allRestaurants = restRes.data;
      const allProducts = prodRes.data;

      // Hero Campaigns
      const campaigns = allRestaurants.filter((r: any) => r.is_featured_campaign);
      setCampaignRestaurants(campaigns);

      // Verified Brands
      const verified = allRestaurants.filter((r: any) => r.is_verified);
      setVerifiedBrands(verified);

      // Brands = Popular Restaurants
      const popularBrandsList = allRestaurants.filter((r: any) => r.is_popular);
      setBrands(popularBrandsList);

      // Offer Restaurants = Restaurants with Discount > 0
      const discountRest = allRestaurants.filter((r: any) => Number(r.discount_percentage) > 0);
      setOfferRestaurants(discountRest);

      // Offer Products = Products where discounted_price < price
      const discountProd = allProducts.filter((p: any) => p.discounted_price && p.discounted_price < p.price);
      setOfferProducts(discountProd);

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

  // Render Functions

  const renderSearchBar = () => (
    <TouchableOpacity
      style={styles.searchContainer}
      onPress={() => router.push('/(tabs)/search')}
      activeOpacity={0.9}
    >
      <Search size={20} color="#6B7280" />
      <View style={styles.searchPlaceholder}>
        <Text style={styles.searchText}>Find your favorite food...</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeroCampaign = ({ item }: { item: any }) => (
    // Outer container takes Full Width for paging
    <View style={{ width: CONTAINER_WIDTH, alignItems: 'center' }}>
      <TouchableOpacity
        style={[styles.heroCard, { width: CARD_WIDTH }]}
        onPress={() => router.push(`/restaurant/${item.id}`)}
        activeOpacity={0.95}
      >
        <Image source={{ uri: getImageUrl(item.campaign_image || item.cover_image || item.logo) }} style={styles.heroImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.heroOverlay}
        >
          <View style={styles.heroContent}>
            {(item.discount_percentage > 0) && (
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{Math.round(item.discount_percentage)}% OFF</Text>
              </View>
            )}
            <Text style={styles.heroTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.heroSubtitle} numberOfLines={1}>{item.description || "Limited Time Offer"}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

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
        {Number(item.discount_percentage) > 0 && (
          <View style={styles.restaurantOverlay}>
            <View style={styles.restaurantTag}>
              <Text style={styles.restaurantTagText}>{Math.round(item.discount_percentage)}% OFF</Text>
            </View>
          </View>
        )}
      </View>
      <View style={styles.restaurantInfo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
          <Text style={styles.restaurantTitle} numberOfLines={1}>{item.name}</Text>
          {item.is_verified && (
            // Matches Restaurant Details Page Style
            <BadgeCheck size={16} color="#1877F2" fill="#1877F2" stroke="white" />
          )}
        </View>
        <Text style={styles.restaurantMeta} numberOfLines={1}>{(item.discount_percentage > 0) ? `${Math.round(item.discount_percentage)}% Storewide` : 'Popular'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderOfferRestaurant = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.featuredCard} onPress={() => router.push(`/restaurant/${item.id}`)}>
      {/* Use cover image for big impact */}
      <Image source={{ uri: getImageUrl(item.cover_image || item.logo) }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredTag}>
          <Text style={styles.featuredTagText}>{Math.round(item.discount_percentage)}% OFF</Text>
        </View>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
          <Text style={{ color: '#EEE', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
            {item.description || "Limited time offer"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductOffer = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.offerCard} onPress={() => router.push(`/product/${item.id}`)}>
      <Image source={{ uri: getImageUrl(item.image) }} style={styles.offerImage} />
      <View style={styles.offerContent}>
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>SAVE</Text>
        </View>
        <Text style={styles.offerTitle} numberOfLines={1}>{item.name}</Text>
        <View style={styles.offerPriceRow}>
          <Text style={styles.offerPriceOld}>KSh {item.price}</Text>
          <Text style={styles.offerPriceNew}>KSh {Math.round(item.discounted_price)}</Text>
        </View>
      </View>
      <View style={styles.addBtnAbs}>
        <Plus color="#FFF" size={16} />
      </View>
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <View style={{ flex: 1, paddingTop: 10 }}>
      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        <Skeleton width={width - 32} height={50} style={{ borderRadius: 25 }} />
      </View>

      {/* Categories */}
      <View style={{ flexDirection: 'row', paddingLeft: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={{ marginRight: 20, alignItems: 'center' }}>
            <Skeleton width={64} height={64} style={{ borderRadius: 32, marginBottom: 8 }} />
            <Skeleton width={40} height={10} style={{ borderRadius: 4 }} />
          </View>
        ))}
      </View>

      {/* Hero */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Skeleton width={width - 32} height={170} style={{ borderRadius: 24 }} />
      </View>

      {/* List Section */}
      <View style={{ paddingHorizontal: 16 }}>
        <Skeleton width={120} height={20} style={{ marginBottom: 16, borderRadius: 4 }} />
        <View style={{ flexDirection: 'row' }}>
          <Skeleton width={280} height={104} style={{ borderRadius: 16, marginRight: 16 }} />
          <Skeleton width={280} height={104} style={{ borderRadius: 16 }} />
        </View>
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
        {/* Search Bar */}
        {renderSearchBar()}

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

        {/* Hero Campaigns - Full Width Carousel */}
        {campaignRestaurants.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <FlatList
              ref={campaignListRef}
              data={campaignRestaurants}
              renderItem={renderHeroCampaign}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled // Snaps to full width
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0 }} // Remove wrapper padding, handled by item
              snapToInterval={CONTAINER_WIDTH} // Interval = Screen Width
              decelerationRate="fast"
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  campaignListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
            />
          </View>
        )}

        {/* Verified Brands (NEW) */}
        {verifiedBrands.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>Verified Brands</Text>
              <TouchableOpacity onPress={() => router.push('/list/verified')}>
                <ArrowRight size={20} color="#111" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={verifiedBrands}
              renderItem={renderBrand}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            />
          </View>
        )}

        {/* 1. Brands (Popular) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Top Brands</Text>
            <TouchableOpacity onPress={() => router.push('/list/popular')}>
              <ArrowRight size={20} color="#111" />
            </TouchableOpacity>
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

        {/* 2. Special Offers (Products) */}
        {offerProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>Special Offers</Text>
            </View>
            <FlatList
              data={offerProducts}
              renderItem={renderProductOffer}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            />
          </View>
        )}

        {/* 3. Product Offers (Horizontal) */}
        {offerProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeading}>Hot Product Deals</Text>
            </View>
            <FlatList
              data={offerProducts}
              renderItem={renderProductOffer}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            />
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // Flat background
    marginHorizontal: 16,
    marginTop: 0, // "Above its now" - removed top margin
    marginBottom: 20,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    // No Shadow/Border
  },
  searchPlaceholder: {
    marginLeft: 12,
    flex: 1,
  },
  searchText: {
    fontSize: 15,
    color: '#9CA3AF',
  },

  // SECTIONS
  section: {
    marginBottom: 16,
  },
  sectionNoMargin: {
    marginTop: 0,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },

  // CATEGORIES
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIconContainer: {
    width: 56, // Smaller size (was 64)
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    marginBottom: 6,
    overflow: 'hidden',
  },
  categoryIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  // HERO CAMPAIGN CARDS (Full Width)
  heroCard: {
    height: 170, // Smaller height as requested
    marginRight: 0,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'flex-end',
    padding: 24, // More padding for premium feel
  },
  heroContent: {
    gap: 6,
  },
  heroBadge: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 32, // Larger title
    fontWeight: '900',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // BRANDS (Clean Minimal Cards)
  restaurantCard: {
    width: 140,
    marginRight: 10, // Reduced from 16 to 10
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  restaurantImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#FFF',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    resizeMode: 'cover',
  },
  restaurantOverlay: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
  },
  restaurantTag: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  restaurantTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  restaurantInfo: {
    alignItems: 'center',
    width: '100%',
  },
  restaurantTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 2,
  },
  restaurantMeta: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // FEATURED OFFERS (Wide Hero Cards)
  featuredCard: {
    width: 300,
    height: 180,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  featuredOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF4500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  featuredTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  featuredContent: {

  },
  featuredName: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // PRODUCT DEALS (Clean Card Style)
  dishCard: {
    width: 170,
    marginRight: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dishImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  dishInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  dishHeader: {
    marginBottom: 4,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    lineHeight: 20,
    marginBottom: 4,
  },
  dishFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF4500',
  },
  addBtn: {
    backgroundColor: '#F3F4F6',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Special Offers (Product) Styles
  offerCard: {
    width: 280, // High width for horizontal card
    marginRight: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    height: 104,
  },
  offerImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    resizeMode: 'cover',
  },
  offerContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
    height: '100%',
  },
  offerBadge: {
    position: 'absolute',
    top: -4,
    right: 0,
    backgroundColor: '#FF4500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  offerBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginTop: 4,
    marginBottom: 4,
    paddingRight: 10,
  },
  offerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline', // Align old and new price
    gap: 8,
  },
  offerPriceOld: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  offerPriceNew: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  addBtnAbs: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#111',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
