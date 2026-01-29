import api from '@/constants/api';
import { getImageUrl } from '@/utils/image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck, Search } from 'lucide-react-native';
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



    const filteredRestaurants = restaurants.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderRestaurant = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/restaurant/${item.id}`)}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: getImageUrl(item.cover_image || item.logo) }} style={styles.image} />
                {Number(item.discount_percentage) > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{Math.round(item.discount_percentage)}% OFF</Text>
                    </View>
                )}
            </View>
            <View style={styles.info}>
                <View style={styles.headerRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    {item.is_verified && (
                        <BadgeCheck size={18} color="#1877F2" fill="#1877F2" stroke="white" />
                    )}
                </View>
                <Text style={styles.desc} numberOfLines={2}>{item.description || 'Delicious food waiting for you.'}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{item.location || 'Location Info'}</Text>
                    <Text style={styles.metaText}>•</Text>
                    <Text style={styles.metaText}>20-30 min</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const getTitle = () => {
        if (type === 'verified') return 'Verified Brands';
        if (type === 'popular') return 'Top Brands';
        if (type === 'all') return 'All Restaurants';
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#FFF',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#1F2937',
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
        paddingVertical: 0,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },

    // Card Styles
    card: {
        flexDirection: 'row', // Horizontal
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        height: 100, // Fixed compact height
    },
    imageContainer: {
        width: 100, // Square image on left
        height: '100%',
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#FF4500',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    info: {
        flex: 1, // Take remaining space
        padding: 10,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },
    desc: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 10,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 13,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    }
});
