
import api, { BASE_URL } from '@/constants/api';
import { useCartStore } from '@/store/useCartStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Flame, Minus, Plus, ShoppingCart, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);
    const insets = useSafeAreaInsets();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}/`);
            setProduct(response.data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/300';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#FF4500" />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text>Product not found</Text>
            </View>
        );
    }

    const handleAddToCart = () => {
        const productToAdd = {
            ...product,
            price: Number(product.price)
        };

        for (let i = 0; i < quantity; i++) {
            addItem(productToAdd);
        }
        router.push('/(tabs)/cart');
    };

    const finalPrice = product.is_promoted ? product.discounted_price : product.price;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft color="#111" size={24} />
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: getImageUrl(product.image) }} style={styles.image} />
                    {product.is_promoted && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{product.discount_percentage}% OFF</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Product Name */}
                    <Text style={styles.name}>{product.name}</Text>

                    {/* Meta Info */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Star fill="#FFB800" stroke="#FFB800" size={18} />
                            <Text style={styles.metaText}>{product.rating}</Text>
                        </View>
                        {product.calories > 0 && (
                            <View style={styles.metaItem}>
                                <Flame fill="#FF4500" stroke="#FF4500" size={18} />
                                <Text style={styles.metaText}>{product.calories} cal</Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Clock color="#666" size={18} />
                            <Text style={styles.metaText}>20-30 min</Text>
                        </View>
                    </View>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        <View>
                            <Text style={styles.price}>KSh {Number(finalPrice).toFixed(2)}</Text>
                            {product.is_promoted && (
                                <Text style={styles.oldPrice}>KSh {Number(product.price).toFixed(2)}</Text>
                            )}
                        </View>

                        {/* Quantity Control - Moved to top right */}
                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus color="#111" size={20} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(quantity + 1)}
                            >
                                <Plus color="#111" size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this item</Text>
                        <Text style={styles.description}>{product.description}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Add to Cart Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <ShoppingCart color="#FFF" size={20} />
                    <Text style={styles.addToCartText}>Add to Cart - KSh {(Number(finalPrice) * quantity).toFixed(2)}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Bg for image area
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 100,
        backgroundColor: '#FFF',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    imageContainer: {
        height: 400, // Taller immersive image
        width: '100%',
        position: 'relative',
        backgroundColor: '#F3F4F6',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badge: {
        position: 'absolute',
        bottom: 50, // Move badge up so it's not hidden by sheet
        right: 20,
        backgroundColor: '#FFDA45', // Glovo yellow
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 10,
        elevation: 5,
    },
    badgeText: {
        color: '#111',
        fontSize: 13,
        fontWeight: '800',
    },
    content: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -50, // Deeper overlap
        paddingHorizontal: 25,
        paddingTop: 35,
        paddingBottom: 120, // Bottom padding for scrolling
        minHeight: 500, // Ensure it fills
    },
    name: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111',
        marginBottom: 15,
        lineHeight: 34,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 25,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '600',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    price: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111',
    },
    oldPrice: {
        fontSize: 16,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginTop: 4,
        fontWeight: '500',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 30,
        padding: 5,
    },
    quantityButton: {
        width: 40,
        height: 40, // Bigger touch targets
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '700',
        marginHorizontal: 15,
        color: '#111',
        minWidth: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        elevation: 20,
    },
    addToCartButton: {
        flexDirection: 'row',
        backgroundColor: '#111', // Bold Black button
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    addToCartText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
