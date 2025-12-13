
import api from '@/constants/api';
import { useCartStore } from '@/store/useCartStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const addItem = useCartStore((state) => state.addItem);

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
        // We need to convert price to number if it's string from API
        const productToAdd = {
            ...product,
            price: Number(product.price)
        };

        for (let i = 0; i < quantity; i++) {
            addItem(productToAdd);
        }
        router.push('/(tabs)/cart');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 180 : 160 }}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image }} style={styles.image} />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ArrowLeft color="#333" size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <Text style={styles.name}>{product.name}</Text>
                        <View style={styles.ratingBadge}>
                            <Star fill="#FFB800" stroke="#FFB800" size={16} />
                            <Text style={styles.ratingText}>{product.rating}</Text>
                        </View>
                    </View>

                    <Text style={styles.price}>KSh {Number(product.price).toFixed(2)}</Text>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{product.description}</Text>

                    <Text style={styles.sectionTitle}>Calories</Text>
                    <Text style={styles.calories}>{product.calories} cal</Text>
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 40 : 90 }]}>
                <View style={styles.quantityControl}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                        <Minus color="#333" size={20} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(quantity + 1)}
                    >
                        <Plus color="#333" size={20} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                    <Text style={styles.addToCartText}>Add to Cart - KSh {(Number(product.price) * quantity).toFixed(2)}</Text>
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
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 25,
        elevation: 5,
    },
    content: {
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#FFF',
        marginTop: -30,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    ratingText: {
        marginLeft: 5,
        fontWeight: 'bold',
        color: '#333',
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF4500',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        marginTop: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    calories: {
        fontSize: 16,
        color: '#888',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 20,
        paddingBottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        elevation: 10,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        padding: 5,
        marginRight: 20,
    },
    quantityButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        elevation: 1,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 15,
    },
    addToCartButton: {
        flex: 1,
        backgroundColor: '#FF4500',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    addToCartText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
