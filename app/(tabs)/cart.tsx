
import { CartItem, useCartStore } from '@/store/useCartStore';
import { useRouter } from 'expo-router';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
    const router = useRouter();
    const { items, incrementQuantity, decrementQuantity, removeItem, getTotal } = useCartStore();
    const subtotal = getTotal();
    const deliveryFee = 500.00; // KSh
    const total = subtotal + deliveryFee;

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>KSh {Number(item.price).toFixed(2)}</Text>
            </View>
            <View style={styles.actions}>
                <View style={styles.quantityControl}>
                    <TouchableOpacity onPress={() => decrementQuantity(item.id)} style={styles.qtyButton}>
                        <Minus size={16} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => incrementQuantity(item.id)} style={styles.qtyButton}>
                        <Plus size={16} color="#333" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
                    <Trash2 size={20} color="#FF4500" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)/menu')}>
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart</Text>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.footer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>KSh {subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>KSh {deliveryFee.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>KSh {total.toFixed(2)}</Text>
                </View>

                <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    emptyText: {
        fontSize: 20,
        color: '#666',
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: '#FF4500',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    shopButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    listContent: {
        padding: 20,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 2,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    itemPrice: {
        fontSize: 14,
        color: '#FF4500',
        marginTop: 4,
    },
    actions: {
        alignItems: 'flex-end',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        padding: 4,
        marginBottom: 8,
    },
    qtyButton: {
        padding: 4,
    },
    qtyText: {
        marginHorizontal: 10,
        fontWeight: 'bold',
    },
    removeButton: {
        padding: 4,
    },
    footer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        color: '#666',
        fontSize: 14,
    },
    summaryValue: {
        color: '#333',
        fontSize: 14,
        fontWeight: '600',
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF4500',
    },
    checkoutButton: {
        backgroundColor: '#FF4500',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
