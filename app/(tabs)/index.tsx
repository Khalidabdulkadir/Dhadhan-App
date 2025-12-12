
import Skeleton from '@/components/Skeleton';
import api from '@/constants/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { Search, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories/'),
        api.get('/products/')
      ]);
      setCategories(catRes.data);
      // For popular items, we just take the first 5 products for now
      setPopularItems(prodRes.data.slice(0, 5));
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({ pathname: '/(tabs)/menu', params: { q: searchQuery } });
    }
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/(tabs)/menu')}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPopularItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.popularCard} onPress={() => router.push(`/product/${item.id}`)}>
      <Image source={{ uri: item.image }} style={styles.popularImage} />
      <View style={styles.popularInfo}>
        <Text style={styles.popularName}>{item.name}</Text>
        <Text style={styles.popularDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.popularPrice}>KSh {item.price}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>★ {item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        <View>
          <Skeleton width={100} height={20} style={{ marginBottom: 5 }} />
          <Skeleton width={150} height={30} />
        </View>
        <Skeleton width={40} height={40} style={{ borderRadius: 20 }} />
      </View>
      <Skeleton width="100%" height={50} style={{ borderRadius: 15, marginBottom: 20 }} />
      <Skeleton width="100%" height={160} style={{ borderRadius: 20, marginBottom: 25 }} />
      <Skeleton width={120} height={25} style={{ marginBottom: 15 }} />
      <View style={{ flexDirection: 'row', marginBottom: 25 }}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={{ marginRight: 15, alignItems: 'center' }}>
            <Skeleton width={50} height={50} style={{ borderRadius: 25, marginBottom: 8 }} />
            <Skeleton width={60} height={15} />
          </View>
        ))}
      </View>
      <Skeleton width={150} height={25} style={{ marginBottom: 15 }} />
      {[1, 2, 3].map(i => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Skeleton width={100} height={100} style={{ borderRadius: 12, marginRight: 15 }} />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={15} style={{ marginBottom: 8 }} />
            <Skeleton width={60} height={20} />
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderSkeleton()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4500']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.restaurantName}>Matrix Restaurant</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
            {user ? (
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&q=80' }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.guestProfile]}>
                <User color="#666" size={24} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#666" size={20} />
          <TextInput
            placeholder="Find your favorite food..."
            style={styles.searchInput}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerText}>Get 20% Discount</Text>
            <Text style={styles.bannerSubtext}>On your first order</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Popular Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Now</Text>
          {popularItems.map((item) => (
            <View key={item.id} style={{ marginBottom: 16 }}>
              {renderPopularItem({ item })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    padding: 4,
    backgroundColor: '#FFF',
    borderRadius: 25,
    elevation: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
    height: 160,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  bannerSubtext: {
    color: '#FFF',
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 15,
    color: '#333',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
    elevation: 2,
    width: 80,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  popularImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  popularInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  popularName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  popularDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  ratingContainer: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FFB800',
  },
  guestProfile: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
