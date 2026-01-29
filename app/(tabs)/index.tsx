import Skeleton from '@/components/Skeleton';
import api from '@/constants/api';
import { useAuthStore } from '@/store/useAuthStore';
import { getImageUrl } from '@/utils/image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, BadgeCheck, MapPin, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
// Use full width for paging container, card will have internal margin
const CONTAINER_WIDTH = width;
const CARD_WIDTH = width - 32; // Actual visual card width

import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function HomeScreen() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const insets = useSafeAreaInsets();


  const [brands, setBrands] = useState<any[]>([]);
  const [verifiedBrands, setVerifiedBrands] = useState<any[]>([]); // NEW
  const [campaignRestaurants, setCampaignRestaurants] = useState<any[]>([]);
  const [offerRestaurants, setOfferRestaurants] = useState<any[]>([]);
  const [offerProducts, setOfferProducts] = useState<any[]>([]);
  const [hotProducts, setHotProducts] = useState<any[]>([]);

  // Data State
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  // Menu / Search State
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);


  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const campaignListRef = React.useRef<FlatList>(null);
  const [activeCampaignIndex, setActiveCampaignIndex] = useState(0);

  const offersListRef = React.useRef<FlatList>(null);
  const offersScrollIndex = React.useRef(0);

  // -- GLOBAL FILTERING LOGIC --
  // We filter all dashboard lists based on selectedLocation dynamically
  const filterByLocation = (items: any[], isProduct = false) => {
    if (!selectedLocation) return items;
    if (isProduct) {
      // For products, we need to check if their restaurant is in the selected location
      // We can do this by finding the restaurant in allRestaurants
      return items.filter(p => {
        const rest = allRestaurants.find(r => r.id === p.restaurant || r.id === p.restaurant_id);
        return rest && rest.location === selectedLocation;
      });
    }
    // For restaurants
    return items.filter(r => r.location === selectedLocation);
  };

  const visibleCampaigns = filterByLocation(campaignRestaurants);
  const visibleVerified = filterByLocation(verifiedBrands);
  const visiblePopular = filterByLocation(brands);
  const visibleOfferProducts = filterByLocation(offerProducts, true);
  const visibleHotProducts = filterByLocation(hotProducts, true);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [restRes, prodRes] = await Promise.all([
        api.get('/restaurants/'),
        api.get('/products/')
      ]);

      const allRest = restRes.data;
      setAllRestaurants(allRest);
      const productsData = prodRes.data;
      setAllProducts(productsData);

      // Extract Locations
      const locs = Array.from(new Set(allRest.map((r: any) => r.location).filter(Boolean))) as string[];
      setLocations(locs);
      if (locs.length > 0 && !selectedLocation) {
        setSelectedLocation(locs[0]);
      }

      // Hero Campaigns
      const campaigns = allRest.filter((r: any) => r.is_featured_campaign);
      setCampaignRestaurants(campaigns);

      // Verified Brands
      const verified = allRest.filter((r: any) => r.is_verified);
      setVerifiedBrands(verified);

      // Brands = Popular Restaurants
      const popularBrandsList = allRest.filter((r: any) => r.is_popular);
      setBrands(popularBrandsList);

      // Offer Restaurants = Restaurants with Discount > 0
      const discountRest = allRest.filter((r: any) => Number(r.discount_percentage) > 0);
      setOfferRestaurants(discountRest);

      // Offer Products = Products where discounted_price < price
      const discountProd = productsData.filter((p: any) => p.discounted_price && p.discounted_price < p.price);
      setOfferProducts(discountProd);

      // Hot Products
      const hot = productsData.filter((p: any) => p.is_hot);
      setHotProducts(hot);

    } catch (error) {
      // Error fetching data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  // Auto-Scroll Effect
  useEffect(() => {
    if (visibleCampaigns.length <= 1) return;

    const intervalId = setInterval(() => {
      setActiveCampaignIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % visibleCampaigns.length;
        campaignListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000); // 4 seconds slide

    return () => clearInterval(intervalId);
  }, [visibleCampaigns]);



  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Render Functions

  // Filtered Logic (Unified Search + Location)
  const getFilteredData = () => {
    // 1. Filter Restaurants by Location
    const locationRestaurants = allRestaurants.filter((r: any) =>
      !selectedLocation || r.location === selectedLocation
    );

    // 2. Filter Restaurants by Search
    const foundRestaurants = locationRestaurants.filter((r: any) =>
      !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 3. Filter Products by Location (via Restaurant) AND Search
    // Assuming product has restaurant_id, we check if that restaurant is in locationRestaurants
    const validRestaurantIds = new Set(locationRestaurants.map((r: any) => r.id));

    const foundProducts = allProducts.filter((p: any) =>
      (validRestaurantIds.has(p.restaurant) || validRestaurantIds.has(p.restaurant_id)) &&
      (!searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return { foundRestaurants, foundProducts };
  };

  const { foundRestaurants, foundProducts } = getFilteredData();

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Search size={20} color="#FF4500" />
      <TextInput
        placeholder={selectedLocation ? `Search in ${selectedLocation}...` : "What are you craving?"}
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#9CA3AF"
      />
      {locations.length > 0 && (
        <TouchableOpacity onPress={() => setShowLocationPicker(!showLocationPicker)} style={{ marginLeft: 8 }}>
          <MapPin size={22} color={selectedLocation ? "#FF4500" : "#6B7280"} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderLocationPicker = () => (
    <View style={styles.locationPickerContainer}>
      <View style={styles.locationPickerHeader}>
        <Text style={styles.locationPickerTitle}>Select Location</Text>
        <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
        <TouchableOpacity
          style={[styles.locationChip, !selectedLocation && styles.activeLocationChip]}
          onPress={() => { setSelectedLocation(null); setShowLocationPicker(false); }}
        >
          <Text style={[styles.locationChipText, !selectedLocation && styles.activeLocationChipText]}>All</Text>
        </TouchableOpacity>
        {locations.map(loc => (
          <TouchableOpacity
            key={loc}
            style={[styles.locationChip, selectedLocation === loc && styles.activeLocationChip]}
            onPress={() => { setSelectedLocation(loc); setShowLocationPicker(false); }}
          >
            <Text style={[styles.locationChipText, selectedLocation === loc && styles.activeLocationChipText]}>{loc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
      <View style={styles.offerImageContainer}>
        <Image source={{ uri: getImageUrl(item.image) }} style={styles.offerImage} />
        {item.discount_percentage > 0 && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>{Math.round(item.discount_percentage)}%</Text>
          </View>
        )}
      </View>
      <View style={styles.offerContent}>
        <Text style={styles.offerTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }} numberOfLines={1}>{item.restaurant_data?.name}</Text>
        <View style={styles.offerPriceRow}>
          <Text style={styles.offerPriceNew}>KSh {Math.round(item.discounted_price)}</Text>
          <Text style={styles.offerPriceOld}>KSh {item.price}</Text>
        </View>
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
      <View style={styles.container}>
        {renderSkeleton()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4500']} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        {renderSearchBar()}

        {/* Location Picker */}
        {showLocationPicker && renderLocationPicker()}

        {/* Main Categories (New) */}


        {/* Dashoard Content - Only show when NOT searching */}
        {!searchQuery && (
          <>
            {/* Hero Campaigns - Full Width Carousel */}
            {visibleCampaigns.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <FlatList
                  ref={campaignListRef}
                  data={visibleCampaigns}
                  renderItem={renderHeroCampaign}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  pagingEnabled // Snaps to full width
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 0 }} // Remove wrapper padding, handled by item
                  snapToInterval={CONTAINER_WIDTH} // Interval = Screen Width
                  decelerationRate="fast"
                  onScrollToIndexFailed={(info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                      campaignListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                  }}
                />
              </View>
            )}

            {/* Main Categories (Moved) */}
            <View style={styles.categoriesRow}>
              {/* 1. Restaurants */}
              <TouchableOpacity
                style={styles.mainCategoryItem}
                onPress={() => router.push('/list/all')}
                activeOpacity={0.8}
              >
                <View style={styles.mainCatIcon}>
                  <Image source={require('@/assets/images/icon-restaurant.png')} style={styles.iconImage} />
                </View>
                <Text style={styles.mainCatText}>Restaurants</Text>
              </TouchableOpacity>

              {/* 2. Verified Brands */}
              <TouchableOpacity
                style={styles.mainCategoryItem}
                onPress={() => router.push('/list/verified')}
                activeOpacity={0.8}
              >
                <View style={styles.mainCatIcon}>
                  <Image source={require('@/assets/images/icon-verified.png')} style={styles.iconImage} />
                </View>
                <Text style={styles.mainCatText}>Verified</Text>
              </TouchableOpacity>

              {/* 3. Special Offers */}
              <TouchableOpacity
                style={styles.mainCategoryItem}
                onPress={() => router.push('/offers')}
                activeOpacity={0.8}
              >
                <View style={styles.mainCatIcon}>
                  <Image source={require('@/assets/images/icon-offer.png')} style={styles.iconImage} />
                </View>
                <Text style={styles.mainCatText}>Offers</Text>
              </TouchableOpacity>

              {/* 4. Menu */}
              <TouchableOpacity
                style={styles.mainCategoryItem}
                onPress={() => router.push('/(tabs)/menu')}
                activeOpacity={0.8}
              >
                <View style={styles.mainCatIcon}>
                  <Image source={require('@/assets/images/icon-menu-modern.png')} style={styles.iconImage} />
                </View>
                <Text style={styles.mainCatText}>Menu</Text>
              </TouchableOpacity>
            </View>

            {/* Verified Brands (NEW) */}
            {visibleVerified.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeading}>Verified Brands</Text>
                  <TouchableOpacity onPress={() => router.push('/list/verified')}>
                    <ArrowRight size={20} color="#111" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={visibleVerified}
                  renderItem={renderBrand}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                />
              </View>
            )}

            {/* 1. Brands (Popular) */}
            {/* <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeading}>Top Brands</Text>
                <TouchableOpacity onPress={() => router.push('/list/popular')}>
                  <ArrowRight size={20} color="#111" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={visiblePopular}
                renderItem={renderBrand}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              />
            </View> */}

            {/* 2. Special Offers (Products) */}
            {visibleOfferProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeading}>Special Offers</Text>
                  <TouchableOpacity onPress={() => router.push('/offers')}>
                    <ArrowRight size={20} color="#111" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  ref={offersListRef}
                  data={visibleOfferProducts}
                  renderItem={renderProductOffer}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                  getItemLayout={(data, index) => ({
                    length: 316, // width 300 + margin 16
                    offset: 316 * index,
                    index,
                  })}
                  onScrollToIndexFailed={(info) => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                      offersListRef.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                  }}
                />
              </View>
            )}

            {/* 3. Hot Products (Horizontal Layout) */}
            {visibleHotProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeading}>Popular Dishes</Text>
                  <TouchableOpacity onPress={() => router.push('/list/hot')}>
                    <ArrowRight size={20} color="#111" />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={visibleHotProducts}
                  renderItem={renderProductOffer} // Reuse the unified offer card render
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalScroll}
                />
              </View>
            )}
          </>
        )}

        <View style={styles.section}>
          <View style={[styles.sectionHeader, { marginTop: 10 }]}>
            <Text style={styles.sectionHeading}>
              {searchQuery ? `Results for "${searchQuery}"` : (selectedLocation ? `Explore ${selectedLocation}` : 'Browse Food')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/menu')}>
              <ArrowRight size={20} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Display Restaurants if searching */}
          {searchQuery && foundRestaurants.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.sectionHeading, { fontSize: 15, marginBottom: 10, marginLeft: 16 }]}>Restaurants</Text>
              <FlatList
                data={foundRestaurants}
                renderItem={renderBrand}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              />
            </View>
          )}

          {/* Display Products (Unified Horizontal) */}
          <View style={{ marginBottom: 20 }}>
            {foundProducts.length > 0 && (
              <FlatList
                data={foundProducts}
                renderItem={renderProductOffer} // Reuse unified card
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              />
            )}

            {foundProducts.length === 0 && foundRestaurants.length === 0 && (
              <View style={{ width: '100%', alignItems: 'center', padding: 20 }}>
                <Text style={{ color: '#888' }}>No delicious items found.</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView >
    </View >
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
    marginTop: 8, // Reduced from 16
    marginBottom: 12, // Reduced from 20
    paddingHorizontal: 16,
    height: 44, // Reduced from 50
    borderRadius: 22,
    // No Shadow/Border
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14, // Slightly smaller
    color: '#1F2937',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    paddingVertical: 0, // Fix alignment
  },

  // Location Picker
  locationPickerContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8, // Reduced from 16
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // Reduced
  },
  locationPickerTitle: {
    fontWeight: '700',
    color: '#374151',
    fontSize: 13,
  },
  locationChip: {
    paddingHorizontal: 12, // Reduced
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeLocationChip: {
    backgroundColor: '#FFF',
    borderColor: '#FF4500',
  },
  locationChipText: {
    fontSize: 12, // Reduced
    fontWeight: '600',
    color: '#4B5563',
  },
  activeLocationChipText: {
    color: '#FF4500',
  },


  // SECTIONS
  section: {
    marginBottom: 8, // Reduced from 12
  },
  sectionNoMargin: {
    marginTop: 0,
    marginBottom: 8, // Reduced from 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 3, // Reduced from 4
  },
  sectionHeading: {
    fontSize: 16, // Reduced from 17
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8, // Reduced from 10
  },

  // HERO (Full Width)
  heroCard: {
    height: 150, // Reduced from 150
    marginRight: 0,
    borderRadius: 16, // Reduced radius slightly
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 6,
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
    padding: 12, // Reduced padding
  },
  heroContent: {
    gap: 2, // Reduced gap
  },
  heroBadge: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 20, // Reduced from 24
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#FFF',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12,
    fontWeight: '600',
  },


  // MAIN CATEGORIES (New)
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Better spacing for 4 items
    paddingHorizontal: 20, // Add side padding
    marginBottom: 12, // Reduced from 24
  },
  mainCategoryItem: {
    alignItems: 'center',
    gap: 2, // Reduced from 4
    flex: 1, // Distribute space
  },
  mainCatIcon: {
    width: 47, // Reduced from 52
    height: 47,
    borderRadius: 16, // Squircle
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF', // White bg for shadow to pop
    marginBottom: 2, // More space for text
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconImage: {
    width: '55%',
    height: '55%',
    resizeMode: 'contain',
  },
  mainCatText: {
    fontSize: 10, // Reduced from 11
    fontWeight: '600', // Reduced weight slightly for cleanliness
    color: '#374151',
    textAlign: 'center',
  },

  // BRANDS
  restaurantCard: {
    width: 110, // Reduced from 120
    marginRight: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8, // Reduced padding
    alignItems: 'center',
    borderWidth: 1, // Replace shadow with light border
    borderColor: '#E5E7EB',
  },
  restaurantImageContainer: {
    width: 60, // Reduced from 70
    height: 60, // Reduced from 70
    borderRadius: 30, // Half of width/height
    marginBottom: 6,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30, // Half of width/height
    resizeMode: 'cover',
  },
  restaurantOverlay: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
  },
  restaurantTag: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  restaurantTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFF',
  },
  restaurantInfo: {
    alignItems: 'center',
    width: '100%',
  },
  restaurantTitle: {
    fontSize: 12, // Reduced from 14
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 2,
  },
  restaurantMeta: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // FEATURED OFFERS
  featuredCard: {
    width: 280,
    height: 160,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
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
  featuredContent: {},
  featuredName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // OFFER CARDS (Product)
  offerCard: {
    width: 160, // Increased from 140
    marginRight: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    flexDirection: 'column',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    height: 185, // Balanced height for 160 width
  },
  offerImageContainer: {
    width: '100%',
    height: 100, // Increased from 85
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  offerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  offerContent: {
    flex: 1,
    padding: 8, // Reduced padding
    justifyContent: 'center',
  },
  offerBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF4500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  offerBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  offerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
    lineHeight: 16,
  },
  offerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  offerPriceOld: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  offerPriceNew: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF4500',
  },

  // HOT PRODUCTS (Grid)
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12, // Increased gap
  },
  hotProductCard: {
    width: (width - 32 - 12) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    // "Cool" Shadow
    shadowColor: '#9CA3AF', // Softer shadow color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  hotProductImage: {
    width: '100%',
    height: 110, // Compact height
    resizeMode: 'cover',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  hotProductContent: {
    padding: 10,
    paddingBottom: 12,
  },
  hotPriceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#FFF', // White tag
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hotPriceText: {
    color: '#FF4500', // Orange text
    fontWeight: '800',
    fontSize: 12,
  },
  hotProductTitle: {
    fontSize: 13, // Reduced from 16
    fontWeight: '700',
    color: '#111',
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 18,
  },
  hotProductDesc: {
    fontSize: 11, // Reduced from 13
    color: '#6B7280',
    marginBottom: 4,
  },
  // Discount Styles for Hot Products
  hotDiscountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FF4500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  hotDiscountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hotOldPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 4,
    width: 200,
  },
  hotPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});
