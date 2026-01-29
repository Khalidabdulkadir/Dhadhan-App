
import { CartItem, useCartStore } from '@/store/useCartStore';
import { logOrderClick } from '@/utils/analytics';
import { getImageUrl } from '@/utils/image';
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

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: getImageUrl(item.image) }} style={styles.itemImage} />
            <View style={styles.itemContent}>
                <View>
                    <Text style={styles.restaurantNameSmall}>{item.restaurant_data?.name}</Text>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemPrice}>KSh {Number(item.price).toFixed(0)}</Text>
                </View>

                <View style={styles.actionsContainer}>
                    <View style={styles.quantityControl}>
                        <TouchableOpacity onPress={() => decrementQuantity(item.id)} style={styles.qtyButton}>
                            <Minus size={14} color="#111" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => incrementQuantity(item.id)} style={styles.qtyButton}>
                            <Plus size={14} color="#111" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
                        <Trash2 size={16} color="#EF4444" />
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

    const handleCheckout = async () => {
        if (items.length === 0) return;

        const restaurant = items[0].restaurant_data; // Assume single restaurant for now

        // Track Checkout Click
        if (restaurant) {
            await logOrderClick(restaurant.id, {
                total_amount: total,
                item_count: items.length,
                restaurant_name: restaurant.name
            });
        }
        if (!restaurant || !restaurant.whatsapp_number) {
            alert("Restaurant contact info not found. Please contact support.");
            return;
        }

        // Clean phone number: remove '+' and any non-digit chars
        const phoneNumber = restaurant.whatsapp_number.replace(/[^\d]/g, '');

        let message = `Hello ${restaurant.name}, I would like to place an order:\n\n`;
        items.forEach(item => {
            message += `${item.quantity}x ${item.name} - KSh ${item.price}\n`;
        });
        message += `\n*Subtotal:* KSh ${subtotal.toFixed(2)}`;
        message += `\n*Delivery Fee:* KSh ${deliveryFee.toFixed(2)}`;
        message += `\n*TOTAL:* KSh ${total.toFixed(2)}`;
        message += `\n\nMy Delivery Location: Nairobi (Please ask for exact pin)`;
        message += `\n\nPaying via: `;
        if (restaurant.till_number) {
            message += `Till Number ${restaurant.till_number}`;
        } else if (restaurant.paybill_number) {
            message += `Paybill ${restaurant.paybill_number}`;
        } else {
            message += `M-Pesa Number ${restaurant.whatsapp_number}`;
        }

        // Use standard web intent which handles both app and web
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                // Fallback for some Android versions or if Link handling fails, just try opening it
                await Linking.openURL(url);
            }
        } catch (err) {
            alert("Could not open WhatsApp. Please ensure it is installed.");
        }
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
                        <Text style={styles.summaryValue}>KSh {subtotal.toFixed(0)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery Fee</Text>
                        {deliveryFee > 0 ? (
                            <Text style={styles.summaryValue}>KSh {deliveryFee.toFixed(0)}</Text>
                        ) : (
                            <Text style={[styles.summaryValue, { color: '#10B981' }]}>Free</Text>
                        )}
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>KSh {total.toFixed(0)}</Text>
                    </View>
                </View>

                <View style={{ gap: 12 }}>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} activeOpacity={0.9}>
                        <Text style={styles.checkoutButtonText}>Order via WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={handleCallOrder}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.callButtonText}>Call to Order</Text>
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
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#F8F9FA',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111',
        letterSpacing: -0.5,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 180, // Increased space for floating footer + payment info
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        borderColor: '#F3F4F6',
        borderWidth: 1,
        // No Shadow -> Flat Design
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    itemContent: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'space-between',
    },
    restaurantNameSmall: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    itemName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
        lineHeight: 20,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: "700",
        color: '#FF4500',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    qtyButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 14,
        // Small shadow for button
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    qtyText: {
        width: 24,
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 14,
        color: '#111',
    },
    removeButton: {
        padding: 6,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 30, // Safe area
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
    },
    summaryContainer: {
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        color: '#6B7280',
        fontSize: 15,
        fontWeight: '500',
    },
    summaryValue: {
        color: '#1F2937',
        fontSize: 15,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 0,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FF4500',
    },
    checkoutButton: {
        backgroundColor: '#FF4500',
        paddingVertical: 18,
        borderRadius: 100, // Pill shape
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    checkoutButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },
    callButton: {
        backgroundColor: '#FFF',
        paddingVertical: 16,
        borderRadius: 100,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    callButtonText: {
        color: '#4B5563',
        fontSize: 16,
        fontWeight: '600',
    },
    paymentHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
        alignSelf: 'flex-start',
    },
});
