
import api, { BASE_URL } from '@/constants/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native'; // Standard expo vector icons or lucide
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RestaurantDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [restaurant, setRestaurant] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRestaurantData();
    }, [id]);

    const fetchRestaurantData = async () => {
        try {
            setLoading(true);
            const [restRes, catRes, prodRes] = await Promise.all([
                api.get(`/restaurants/${id}/`),
                api.get(`/categories/?restaurant=${id}`),
                api.get(`/products/?restaurant=${id}`)
            ]);

            setRestaurant(restRes.data);
            const fetchedCategories = catRes.data;
            setCategories(fetchedCategories);
            setProducts(prodRes.data);

            if (fetchedCategories.length > 0) {
                setSelectedCategory(fetchedCategories[0].id);
            }
        } catch (error) {
            console.error("Error fetching restaurant details:", error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/150';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category === selectedCategory || p.category?.id === selectedCategory)
        : products;

    const renderCategoryPill = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.categoryPill,
                selectedCategory === item.id && styles.activeCategoryPill
            ]}
            onPress={() => setSelectedCategory(item.id)}
        >
            <Text style={[
                styles.categoryPillText,
                selectedCategory === item.id && styles.activeCategoryPillText
            ]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    const renderProduct = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.productCard}
            onPress={() => router.push(`/product/${item.id}`)}
        >
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.productPrice}>KSh {item.price}</Text>
            </View>
            <View style={styles.productImageContainer}>
                <Image source={{ uri: getImageUrl(item.image) }} style={styles.productImage} />
                <View style={styles.addButton}>
                    <Plus color="#FFF" size={16} />
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#FF4500" />
            </View>
        );
    }

    if (!restaurant) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text>Restaurant not found</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Hero Image (Full Width) */}
            <View style={styles.heroContainer}>
                <Image source={{ uri: getImageUrl(restaurant?.logo) }} style={styles.heroImage} />
                <View style={styles.heroOverlay} />

                {/* Floating Back Button */}
                <TouchableOpacity
                    style={[styles.backButton, { top: insets.top + 10 }]}
                    onPress={() => router.back()}
                >
                    <ChevronLeft color="#1F2937" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.contentScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Content Sheet (Overlaps Image) */}
                <View style={styles.sheetContainer}>
                    {/* Header Info */}
                    <View style={styles.headerInfo}>
                        <View style={styles.titleRow}>
                            <Text style={styles.restaurantName}>{restaurant?.name}</Text>
                            <View style={styles.ratingBadge}>
                                <Text style={styles.ratingText}>⭐ 4.8 (500+)</Text>
                            </View>
                        </View>
                        <Text style={styles.restaurantMeta}>
                            Burgers • American • Fast Food
                        </Text>

                        <View style={styles.deliveryRow}>
                            <View style={styles.deliveryPill}>
                                <Text style={styles.deliveryText}>🕒 20-30 min</Text>
                            </View>
                            <View style={styles.deliveryPill}>
                                <Text style={styles.deliveryText}>🛵 Free delivery</Text>
                            </View>
                        </View>
                    </View>

                    {/* Categories (Sticky-ish feel) */}
                    <View style={styles.categoriesSection}>
                        <FlatList
                            data={categories}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderCategoryPill}
                            contentContainerStyle={styles.categoriesList}
                        />
                    </View>

                    {/* Products */}
                    <View style={styles.productsSection}>
                        <Text style={styles.sectionTitle}>Menu</Text>
                        <View style={styles.productsGrid}>
                            {filteredProducts.map(item => renderProduct(item))}
                        </View>
                        {filteredProducts.length === 0 && (
                            <Text style={styles.emptyText}>No items in this category.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Hero & Header
    heroContainer: {
        height: 200, // Reduced as requested
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 10,
    },

    // Content Sheet
    contentScroll: {
        flex: 1,
        zIndex: 10, // Ensure content is above hero image
    },
    sheetContainer: {
        marginTop: -30, // Less overlap to avoid hiding things
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 30,
        minHeight: 500,
    },

    // Header Info
    headerInfo: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    restaurantName: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        marginRight: 10,
    },
    ratingBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        color: '#D97706',
        fontWeight: '700',
        fontSize: 12,
    },
    restaurantMeta: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 15,
    },
    deliveryRow: {
        flexDirection: 'row',
        gap: 10,
    },
    deliveryPill: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    deliveryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },

    // Categories
    categoriesSection: {
        marginBottom: 20,
    },
    categoriesList: {
        paddingHorizontal: 20,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeCategoryPill: {
        backgroundColor: '#FFF0E6', // Light orange bg
        borderColor: '#FF4500',
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    activeCategoryPillText: {
        color: '#FF4500',
        fontWeight: '700',
    },

    // Products Section
    productsSection: {
        paddingHorizontal: 20,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111',
        marginBottom: 15,
        width: '100%', // Ensure title takes full width
    },
    productCard: {
        width: '48%', // 2 per row
        flexDirection: 'column', // Vertical layout
        marginBottom: 20,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderBottomWidth: 0, // Remove separator style
    },
    productImageContainer: {
        position: 'relative',
        width: '100%',
        height: 120, // Taller image for grid
        marginBottom: 10,
    },
    productImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        resizeMode: 'cover',
    },
    productInfo: {
        flex: 1,
        width: '100%',
    },
    productName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    productDesc: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
        lineHeight: 16,
        display: 'none', // Hide desc in grid to save space? Or limit lines
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111',
    },
    addButton: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#FFF',
        borderRadius: 16,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#9CA3AF',
    }
});
