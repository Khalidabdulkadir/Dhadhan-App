
import Skeleton from '@/components/Skeleton';
import api, { BASE_URL } from '@/constants/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Image, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MenuScreen() {
    const router = useRouter();
    const { q } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (q) {
            setSearchQuery(q as string);
        }
    }, [q]);

    const fetchData = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                api.get('/categories/'),
                api.get('/products/')
            ]);
            setCategories(catRes.data);
            setProducts(prodRes.data);
        } catch (error) {
            console.error('Error fetching menu:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const filteredItems = products.filter(item =>
        (selectedCategory === 'all' || item.category === selectedCategory) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderCategory = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.categoryChip,
                selectedCategory === item.id && styles.activeCategoryChip
            ]}
            onPress={() => setSelectedCategory(item.id)}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.categoryChipText,
                selectedCategory === item.id && styles.activeCategoryChipText
            ]}>{item.name}</Text>
        </TouchableOpacity>
    );

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/300';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/product/${item.id}` as any)}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: getImageUrl(item.image) }} style={styles.cardImage} resizeMode="cover" />
                {item.is_promoted && item.discount_percentage > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.discount_percentage}% OFF</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {item.is_promoted && item.discount_percentage > 0 ? (
                            <Text style={{ color: '#FF4500', fontWeight: 'bold' }}>KSh {item.discounted_price}</Text>
                        ) : (
                            <Text style={styles.cardPrice}>KSh {item.price}</Text>
                        )}
                        {item.is_promoted && item.discount_percentage > 0 && (
                            <Text style={styles.oldPrice}>KSh {item.price}</Text>
                        )}
                    </View>
                </View>

                {item.restaurant_data && (
                    <View style={styles.restaurantContainer}>
                        <Text style={styles.restaurantName} numberOfLines={1}>
                            By {item.restaurant_data.name}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderSkeleton = () => (
        <View style={{ padding: 20 }}>
            <Skeleton width={150} height={40} style={{ marginBottom: 25, borderRadius: 8 }} />
            <Skeleton width="100%" height={56} style={{ borderRadius: 16, marginBottom: 30 }} />
            <View style={{ flexDirection: 'row', marginBottom: 30 }}>
                {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} width={100} height={40} style={{ borderRadius: 25, marginRight: 12 }} />
                ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4].map(i => (
                    <View key={i} style={{ width: '48%', marginBottom: 20 }}>
                        <Skeleton width="100%" height={160} style={{ borderRadius: 20, marginBottom: 12 }} />
                        <Skeleton width="80%" height={20} style={{ marginBottom: 8 }} />
                        <Skeleton width="50%" height={20} />
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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Our Menu</Text>
            </View>

            <View style={styles.searchContainer}>
                <Search color="#1F2937" size={20} />
                <TextInput
                    placeholder="What are you craving?"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList
                    data={[{ id: 'all', name: 'All' }, ...categories]}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={[styles.menuList, { paddingBottom: 40 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4500']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No items found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 5,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.5,
    },
    // Compact Search Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 13,
        color: '#1F2937',
        fontWeight: '500',
        fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
    // Categories
    categoriesContainer: {
        marginBottom: 12,
    },
    categoriesList: {
        paddingHorizontal: 16,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginRight: 8,
    },
    activeCategoryChip: {
        backgroundColor: '#111827',
        transform: [{ scale: 1.02 }],
    },
    categoryChipText: {
        fontWeight: '600',
        color: '#4B5563',
        fontSize: 13,
    },
    activeCategoryChipText: {
        color: '#FFFFFF',
    },
    menuList: {
        paddingHorizontal: 12,
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    card: {
        width: '49%',
        marginBottom: 16,
        // Removed shadows, borders, background
    },
    imageContainer: {
        width: '100%',
        height: 110,
        borderRadius: 8, // Small radius
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#F0F0F0', // Slight placeholder color
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 6,
        left: 6,
        backgroundColor: '#FF4500',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardContent: {
        paddingTop: 8, // Only top padding needed
        paddingHorizontal: 0,
    },
    cardHeader: {
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '400', // Not bold
        color: '#1F2937',
        marginBottom: 2,
    },
    cardPrice: {
        fontSize: 13,
        fontWeight: '700', // Price bold
        color: '#111827',
    },
    oldPrice: {
        fontSize: 11,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginLeft: 6,
    },
    restaurantContainer: {
        marginTop: 2,
    },
    restaurantName: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '400',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
        fontWeight: '500',
    },
});
