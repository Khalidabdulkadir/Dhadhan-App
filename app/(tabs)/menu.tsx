
import EmptyState from '@/components/EmptyState';
import Skeleton from '@/components/Skeleton';
import api from '@/constants/api';
import { getImageUrl } from '@/utils/image';
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
            // Error fetching
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
            <View style={styles.container}>
                {renderSkeleton()}
            </View>
        );
    }

    return (
        <View style={styles.container}>
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
                    <EmptyState
                        title="No Items"
                        message={`We couldn't find any items matching "${searchQuery}".`}
                        style={{ marginTop: 40 }}
                    />
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
        fontSize: 28,
        fontWeight: '900',
        color: '#111',
        letterSpacing: -0.5,
        marginBottom: 8,
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
        width: '48%',
        marginBottom: 12, // Reduced
        backgroundColor: '#FFF',
        borderRadius: 12, // Reduced radius slightly
        borderWidth: 1, // Flat design with border
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        paddingBottom: 0,
    },
    imageContainer: {
        width: '100%',
        height: 100, // Reduced from 140
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#F3F4F6',
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
        padding: 8, // Reduced padding
    },
    cardHeader: {
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 13, // Smaller font
        fontWeight: '600',
        color: '#111',
        marginBottom: 2,
        lineHeight: 18,
    },
    cardPrice: {
        fontSize: 14, // Smaller price
        fontWeight: '700',
        color: '#FF4500',
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
