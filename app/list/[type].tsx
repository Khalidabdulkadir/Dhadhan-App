import api, { BASE_URL } from '@/constants/api';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, BadgeCheck } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RestaurantListScreen() {
    const { type } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState<any[]>([]);

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
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/150';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

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
        return 'Restaurants';
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{getTitle()}</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#FF4500" />
                </View>
            ) : (
                <FlatList
                    data={restaurants}
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
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    imageContainer: {
        height: 160,
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
        padding: 16,
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
