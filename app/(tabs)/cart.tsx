
import { BASE_URL } from '@/constants/api';
import { CartItem, useCartStore } from '@/store/useCartStore';
import { useRouter } from 'expo-router';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
    const router = useRouter();
    const { items, incrementQuantity, decrementQuantity, removeItem, getTotal } = useCartStore();
    const subtotal = getTotal();
    const deliveryFee = items.reduce((acc, item) => acc + (Number(item.shipping_fee) || 0), 0);
    const total = subtotal + deliveryFee;

    const getImageUrl = (url: string) => {
        if (!url) return 'https://via.placeholder.com/150';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: getImageUrl(item.image) }} style={styles.itemImage} />
            <View style={styles.itemContent}>
                <View style={styles.itemInfo}>
                    <Text style={styles.restaurantNameSmall}>{item.restaurant_data?.name}</Text>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemPrice}>KSh {Number(item.price).toFixed(2)}</Text>
                </View>

                <View style={styles.actionsRow}>
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
                        <Trash2 size={18} color="#FF4500" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <ShoppingBag size={60} color="#DDD" />
                </View>
                <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                <Text style={styles.emptyText}>Looks like you haven't added anything yet.</Text>
                <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)/menu')}>
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleCheckout = () => {
        if (items.length === 0) return;

        const restaurant = items[0].restaurant_data; // Assume single restaurant for now
        if (!restaurant || !restaurant.whatsapp_number) {
            alert("Restaurant contact info not found. Please contact support.");
            return;
        }

        let message = `Hello ${restaurant.name}, I would like to place an order:%0A%0A`;
        items.forEach(item => {
            message += `${item.quantity}x ${item.name} - KSh ${item.price}%0A`;
        });
        message += `%0A*Subtotal:* KSh ${subtotal.toFixed(2)}`;
        message += `%0A*Delivery Fee:* KSh ${deliveryFee.toFixed(2)}`;
        message += `%0A*TOTAL:* KSh ${total.toFixed(2)}`;
        message += `%0A%0AMy Delivery Location: Nairobi (Please ask for exact pin)`;
        message += `%0A%0APaying via: `;
        if (restaurant.till_number) {
            message += `Till Number ${restaurant.till_number}`;
        } else if (restaurant.paybill_number) {
            message += `Paybill ${restaurant.paybill_number}`;
        } else {
            message += `M-Pesa Number ${restaurant.whatsapp_number}`;
        }

        const url = `whatsapp://send?phone=${restaurant.whatsapp_number}&text=${message}`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                alert("WhatsApp is not installed on this device");
            }
        });
    };

    const handleCallOrder = () => {
        if (items.length === 0) return;
        const restaurant = items[0].restaurant_data;
        if (!restaurant || !restaurant.whatsapp_number) {
            alert("Number not found");
            return;
        }
        Linking.openURL(`tel:${restaurant.whatsapp_number}`);
    };

    const restaurant = items.length > 0 ? items[0].restaurant_data : null;
    const restaurantNumber = restaurant?.whatsapp_number;

    const renderFooter = () => (
        <View style={{ paddingBottom: 20 }}>
            {/* Payment Info in Scrollable Area */}
            {(restaurantNumber || restaurant?.bank_name || restaurant?.paybill_number || restaurant?.till_number) && (
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentHeader}>Payment Details:</Text>

                    {/* M-Pesa */}
                    {restaurantNumber && (
                        <Text style={styles.paymentInfoText}>M-Pesa: <Text style={styles.paymentPhone}>{restaurantNumber}</Text></Text>
                    )}

                    {/* Paybill */}
                    {restaurant?.paybill_number && (
                        <Text style={styles.paymentInfoText}>Paybill: <Text style={styles.paymentPhone}>{restaurant.paybill_number}</Text></Text>
                    )}

                    {/* Till */}
                    {restaurant?.till_number && (
                        <Text style={styles.paymentInfoText}>Till No: <Text style={styles.paymentPhone}>{restaurant.till_number}</Text></Text>
                    )}

                    {/* Bank */}
                    {restaurant?.bank_name && (
                        <View style={{ marginTop: 4 }}>
                            <Text style={styles.paymentInfoText}>Bank: {restaurant.bank_name}</Text>
                            <Text style={styles.paymentInfoText}>Acc: <Text style={styles.paymentPhone}>{restaurant.bank_account_number}</Text></Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Cart ({items.length})</Text>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={renderFooter}
            />

            <View style={styles.footer}>
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>KSh {subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee</Text>
                        {deliveryFee > 0 ? (
                            <Text style={styles.summaryValue}>KSh {deliveryFee.toFixed(2)}</Text>
                        ) : (
                            <Text style={[styles.summaryValue, { color: '#059669' }]}>Free</Text>
                        )}
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>KSh {total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                        <Text style={styles.checkoutButtonText}>Order via WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.checkoutButton, { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#FF4500' }]}
                        onPress={handleCallOrder}
                    >
                        <Text style={[styles.checkoutButtonText, { color: '#FF4500' }]}>Call to Order</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    // ... existing styles ...
    paymentInfo: {
        backgroundColor: '#E0F2FE',
        padding: 10,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
    },
    paymentInfoText: {
        color: '#0369A1',
        fontWeight: '600',
    },
    paymentPhone: {
        fontWeight: '800',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        marginBottom: 30,
        textAlign: 'center',
    },
    shopButton: {
        backgroundColor: '#FF4500',
        paddingHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 30,
        elevation: 4,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    shopButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F8F9FA',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    listContent: {
        padding: 20,
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    itemImage: {
        width: 90,
        height: 90,
        borderRadius: 15,
    },
    itemContent: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    itemInfo: {
        marginBottom: 8,
    },
    restaurantNameSmall: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: 2,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: "600",
        color: '#FF4500',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        padding: 4,
    },
    qtyButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        elevation: 1,
    },
    qtyText: {
        marginHorizontal: 12,
        fontWeight: 'bold',
        fontSize: 14,
    },
    removeButton: {
        padding: 8,
        backgroundColor: '#FFF0EB',
        borderRadius: 12,
    },
    footer: {
        backgroundColor: '#FFF',
        padding: 25,
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    summaryContainer: {
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        color: '#6B7280',
        fontSize: 15,
    },
    summaryValue: {
        color: '#1F2937',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF4500',
    },
    checkoutButton: {
        backgroundColor: '#FF4500',
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    checkoutButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    paymentHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
        alignSelf: 'flex-start',
    },
});
