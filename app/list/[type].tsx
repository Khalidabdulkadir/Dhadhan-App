import api from '@/constants/api';
import { getImageUrl } from '@/utils/image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Clock, Heart, MapPin, Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RestaurantListScreen() {
    const { type } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, [type]);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const res = await api.get('/restaurants/');
            const allRest = res.data;

            let filtered = [];
            // If viewing 'all', we fetch everything and split into sections in render.
            // If viewing 'verified' or 'popular' specifically, we filter here for the main list.
            if (type === 'verified') {
                filtered = allRest.filter((r: any) => r.is_verified);
            } else if (type === 'popular') {
                filtered = allRest.filter((r: any) => r.is_popular);
            } else {
                filtered = allRest;
            }
            setRestaurants(filtered);
        } catch (error) {
            // Error fetching
        } finally {
            setLoading(false);
        }
    };

    // Filter main list by search
    const filteredRestaurants = restaurants.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Derived lists for Hub View (only valid when type === 'all' or default)
    const verifiedBrands = restaurants.filter(r => r.is_verified);
    const popularBrands = restaurants.filter(r => r.is_popular); // Assuming is_popular exists

    // --- RENDERERS ---

    // 1. Horizontal Circle Brand (Verified)
    const renderBrand = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.brandCard}
            onPress={() => router.push(`/restaurant/${item.id}`)}
            activeOpacity={0.8}
        >
            <View style={styles.brandImageContainer}>
                <Image source={{ uri: getImageUrl(item.logo || item.cover_image) }} style={styles.brandLogo} />
                {item.is_verified && (
                    <View style={styles.brandVerifiedBadge}>
                        <BadgeCheck size={12} color="#FFF" fill="#1877F2" />
                    </View>
                )}
            </View>
            <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );

    // 2. Main Vertical Restaurant Card (Cool Style)
    const renderRestaurant = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/restaurant/${item.id}`)}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: getImageUrl(item.cover_image || item.logo) }} style={styles.image} />
                {/* Overlay Gradient or Badges */}
                <View style={styles.cardHeaderOverlay}>
                    {item.is_verified && (
                        <View style={styles.verifiedTag}>
                            <BadgeCheck size={14} color="#FFF" fill="#3B82F6" />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                    <View style={styles.heartButton}>
                        <Heart size={16} color="#111" />
                    </View>
                </View>
            </View>

            <View style={styles.info}>
                <View style={styles.mainInfoRow}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                </View>

                <Text style={styles.desc} numberOfLines={1}>{item.description || 'Delicious food & quick delivery.'}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.metaText}>40-55 min</Text>
                    </View>
                    <Text style={styles.dot}>•</Text>
                    <View style={styles.metaItem}>
                        <MapPin size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{item.location || '2.5 km'}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => {
        // Only show Hub sections if we are in 'all' mode and NOT searching
        if (type !== 'all' && type !== undefined) return null;
        if (searchQuery.length > 0) return null;

        return (
            <View>
                {/* Verified Brands Section */}
                {verifiedBrands.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeading}>Verified Brands</Text>
                            <TouchableOpacity onPress={() => router.push('/list/verified')}>
                                <Text style={styles.seeAllText}>See all</Text>
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
                {/* Top Brands Section (Optional) */}
                {popularBrands.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeading}>Top Brands</Text>
                            <TouchableOpacity onPress={() => router.push('/list/popular')}>
                                <Text style={styles.seeAllText}>See all</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={popularBrands}
                            renderItem={renderBrand}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalScroll}
                        />
                    </View>
                )}
                <Text style={[styles.sectionHeading, { paddingHorizontal: 16, marginBottom: 12, marginTop: 10 }]}>All Restaurants</Text>
            </View>
        );
    };

    const getTitle = () => {
        if (type === 'verified') return 'Verified Brands';
        if (type === 'popular') return 'Top Brands';
        return 'Restaurants';
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{getTitle()}</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search size={20} color="#6B7280" />
                <TextInput
                    placeholder="Search restaurants..."
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF4500" />
                </View>
            ) : (
                <FlatList
                    data={filteredRestaurants}
                    renderItem={renderRestaurant}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No restaurants found.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFF',
    },
    backBtn: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12, // Taller search bar
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1F2937',
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
        paddingVertical: 0,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111',
    },
    listContent: {
        paddingBottom: 40,
    },

    // SECTION STYLES
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF4500', // Our App Color
    },
    horizontalScroll: {
        paddingHorizontal: 16,
    },

    // BRAND CARD (Horizontal)
    brandCard: {
        width: 80,
        marginRight: 16,
        alignItems: 'center',
    },
    brandImageContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFF',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    brandLogo: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
        resizeMode: 'cover',
    },
    brandVerifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 2,
    },
    brandName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },

    // MAIN RESTAURANT CARD (Vertical)
    card: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        overflow: 'visible', // For shadow
    },
    imageContainer: {
        height: 160,
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#F3F4F6',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardHeaderOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    verifiedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#111',
    },
    heartButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    info: {
        padding: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: '#FFF',
    },
    mainInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
        flex: 1,
        marginRight: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111', // Black Badge
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingScore: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    desc: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    dot: {
        marginHorizontal: 8,
        color: '#9CA3AF',
    },
    deliveryFee: {
        color: '#FF4500',
        fontWeight: '700',
        fontSize: 13,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    }
});
