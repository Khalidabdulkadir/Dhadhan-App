import { CartItem, useCartStore } from '@/store/useCartStore';
import { logOrderClick } from '@/utils/analytics';
import { getImageUrl } from '@/utils/image';
import { useRouter } from 'expo-router';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
                            <Minus size={16} color="#111" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => incrementQuantity(item.id)} style={styles.qtyButton}>
                            <Plus size={16} color="#111" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
                        <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (items.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <ShoppingBag size={64} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                <Text style={styles.emptyText}>Find your next favorite meal!</Text>
                <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)/menu')}>
                    <Text style={styles.shopButtonText}>Start Exploring</Text>
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
        <View style={{ paddingBottom: 24, paddingHorizontal: 4 }}>
            {/* Payment Info in Scrollable Area */}
            {(restaurantNumber || restaurant?.bank_name || restaurant?.paybill_number || restaurant?.till_number) && (
                <View style={styles.paymentInfo}>
                    <Text style={styles.paymentHeader}>Payment Details</Text>
                    {/* Paybill */}
                    {restaurant?.paybill_number && (
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Paybill:</Text>
                            <Text style={styles.paymentValue}>{restaurant.paybill_number}</Text>
                        </View>
                    )}
                    {/* Till */}
                    {restaurant?.till_number && (
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Till No:</Text>
                            <Text style={styles.paymentValue}>{restaurant.till_number}</Text>
                        </View>
                    )}
                    {/* Bank */}
                    {restaurant?.bank_name && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={styles.paymentLabel}>Bank: {restaurant.bank_name}</Text>
                            <Text style={styles.paymentLabel}>Acc: <Text style={styles.paymentValue}>{restaurant.bank_account_number}</Text></Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{items.length}</Text>
                    </View>
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
                                <Text style={[styles.summaryValue, { color: '#059669' }]}>Free</Text>
                            )}
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>KSh {total.toFixed(0)}</Text>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout} activeOpacity={0.9}>
                            <Text style={styles.checkoutButtonText}>Order via WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.callButton}
                            onPress={handleCallOrder}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.callButtonText}>Call Restaurant</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Cool gray background
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -1,
    },
    badgeContainer: {
        backgroundColor: '#FF4500',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 220, // Space for footer
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        // Modern shadow
        shadowColor: '#6B7280',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    itemImage: {
        width: 88,
        height: 88,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
    },
    itemContent: {
        flex: 1,
        marginLeft: 14,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    restaurantNameSmall: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        lineHeight: 20,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FF4500',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    qtyButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    qtyText: {
        width: 32,
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 15,
        color: '#111',
    },
    removeButton: {
        padding: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
    },

    // FOOTER
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        // Stronger shadow for floating feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 20,
    },
    summaryContainer: {
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
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
        alignItems: 'flex-end',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    totalValue: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FF4500',
        letterSpacing: -0.5,
    },
    actionButtons: {
        gap: 12,
    },
    checkoutButton: {
        backgroundColor: '#111827', // Dark modern button
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    checkoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    callButton: {
        backgroundColor: '#EFF6FF',
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    callButtonText: {
        color: '#1D4ED8',
        fontSize: 16,
        fontWeight: '700',
    },

    // PAYMENT INFO
    paymentInfo: {
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    paymentHeader: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E3A8A',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    paymentLabel: {
        color: '#3B82F6',
        fontWeight: '600',
        fontSize: 14,
        marginRight: 6,
    },
    paymentValue: {
        color: '#1E40AF',
        fontWeight: '800',
        fontSize: 15,
    },

    // EMPTY STATE
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 32,
        textAlign: 'center',
    },
    shopButton: {
        backgroundColor: '#FF4500',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 100,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    shopButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
