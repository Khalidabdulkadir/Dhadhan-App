
import Skeleton from '@/components/Skeleton';
import api from '@/constants/api';
import { useCartStore } from '@/store/useCartStore';
import { getImageUrl } from '@/utils/image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Flame, Minus, Plus, ShoppingCart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
            // Error fetching product
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return (
            <View style={styles.container}>
                <View style={{ height: 420, backgroundColor: '#F3F4F6' }}>
                    {/* Image Skeleton */}
                </View>
                <View style={[styles.content, { marginTop: -45, paddingTop: 32 }]}>
                    <Skeleton width={200} height={32} style={{ marginBottom: 16, borderRadius: 8 }} />
                    <View style={{ flexDirection: 'row', gap: 20, marginBottom: 24 }}>
                        <Skeleton width={80} height={24} style={{ borderRadius: 6 }} />
                        <Skeleton width={80} height={24} style={{ borderRadius: 6 }} />
                    </View>
                    <View style={{ marginBottom: 30 }}>
                        <Skeleton width={120} height={36} style={{ marginBottom: 8, borderRadius: 8 }} />
                        <Skeleton width={100} height={20} style={{ borderRadius: 4 }} />
                    </View>
                    <Skeleton width={150} height={24} style={{ marginBottom: 12, borderRadius: 4 }} />
                    <Skeleton width="100%" height={100} style={{ borderRadius: 8 }} />
                </View>
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

    const finalPrice = (Number(product.discount_percentage) > 0) ? product.discounted_price : product.price;

    const handleAddToCart = () => {
        const productToAdd = {
            ...product,
            price: Number(finalPrice)
        };

        for (let i = 0; i < quantity; i++) {
            addItem(productToAdd);
        }
        router.push('/(tabs)/cart');
    };

    return (
        <View style={styles.container}>
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
                    {(Number(product.discount_percentage) > 0) && (
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

                        {product.calories > 0 && (
                            <View style={styles.metaItem}>
                                <Flame fill="#FF4500" stroke="#FF4500" size={18} />
                                <Text style={styles.metaText}>{product.calories} cal</Text>
                            </View>
                        )}
                        <View style={styles.metaItem}>
                            <Clock color="#666" size={18} />
                            <Text style={styles.metaText}>40-55 min</Text>
                        </View>
                    </View>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        <View>
                            <Text style={styles.price}>KSh {Number(finalPrice).toFixed(2)}</Text>
                            {(Number(product.discount_percentage) > 0) && (
                                <Text style={styles.oldPrice}>KSh {Number(product.price).toFixed(2)}</Text>
                            )}
                        </View>

                        {/* Quantity Control - Moved to top right */}
                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus color="#FFF" size={18} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(quantity + 1)}
                            >
                                <Plus color="#FFF" size={18} />
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
        backgroundColor: '#FFF',
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
        backgroundColor: 'rgba(255,255,255,0.9)', // Glass-like
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    imageContainer: {
        height: 420, // Taller image
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
        bottom: 50,
        right: 20,
        backgroundColor: '#FF4500', // Changed to Orange for better contrast
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        zIndex: 10,
        elevation: 5,
        shadowColor: '#FF4500',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 36, // Smoother curve
        borderTopRightRadius: 36,
        marginTop: -45,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 130,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    name: {
        fontSize: 26,
        fontWeight: '900',
        color: '#111',
        marginBottom: 8, // Tighter spacing
        lineHeight: 32,
        letterSpacing: -0.5,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginBottom: 24,
        paddingVertical: 4,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    metaText: {
        color: '#4B5563',
        fontSize: 13,
        fontWeight: '600',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        padding: 16,
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    price: {
        fontSize: 28, // Slightly smaller but bolder
        fontWeight: '900',
        color: '#111',
    },
    oldPrice: {
        fontSize: 15,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
        marginTop: 2,
        fontWeight: '600',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 30, // Pill shape
        padding: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    quantityButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111', // Black buttons
        borderRadius: 18,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '700',
        marginHorizontal: 16,
        color: '#111',
        minWidth: 16,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18, // Reduced from 20
        fontWeight: '800',
        color: '#111',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 15,
        color: '#6B7280', // Lighter text
        lineHeight: 24,
        fontWeight: '400',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'transparent',
    },
    addToCartButton: {
        flexDirection: 'row',
        backgroundColor: '#FF4500', // Signature Orange
        paddingVertical: 18,
        borderRadius: 24, // Modern pill
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    addToCartText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
