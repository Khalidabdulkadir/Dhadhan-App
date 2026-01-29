
import api from '@/constants/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCartStore();
    const { setStatus } = useOrderStore();
    const { isAuthenticated, user } = useAuthStore();

    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const subtotal = getTotal();
    const deliveryFee = 500; // Fixed delivery fee
    const total = subtotal + deliveryFee;

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            Alert.alert('Login Required', 'Please login to place an order', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/auth/login' as any) }
            ]);
            return;
        }

        if (!address.trim()) {
            Alert.alert('Error', 'Please enter your delivery location/address');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: items.map(item => ({ id: item.id, quantity: item.quantity })),
                total_amount: total,
                delivery_address: address,
                payment_method: 'whatsapp', // Default for now
                phone_number: '',
                status: 'received'
            };

            // Post order to backend
            await api.post('/orders/', orderData);

            setStatus('received');

            // Generate WhatsApp Message
            const restaurantName = items[0]?.restaurant_data?.name || 'Dhadhan App';
            const restaurantPhone = items[0]?.restaurant_data?.whatsapp_number || '254700000000'; // Fallback needs to be handled

            // Format Items List for Message
            const itemsList = items.map(i => `- ${i.quantity}x ${i.name} (${i.restaurant_data?.name || ''})`).join('\n');

            const message = `*New Order from ${user?.first_name || 'Customer'}*\n\n` +
                `*Items:*\n${itemsList}\n\n` +
                `*Location:* ${address}\n` +
                `*Total:* KSh ${total.toFixed(2)}\n\n` +
                `Please confirm my order.`;

            const encodedMessage = encodeURIComponent(message);
            // Use "https://wa.me/" which works on both Android (via intent) and iOS (via Universal Link)
            // It's more reliable than "whatsapp://" if the app isn't installed, as it falls back to browser.
            const whatsappUrl = `https://wa.me/${restaurantPhone.replace('+', '')}?text=${encodedMessage}`;

            // Try to open WhatsApp
            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
                await Linking.openURL(whatsappUrl);
            } else {
                await Linking.openURL(whatsappUrl); // Try anyway, usually browser picks it up
            }

            clearCart();
            router.replace('/tracking');
        } catch (error: any) {
            // Order failed
            const errorMessage = error.response?.data?.detail
                || error.response?.data?.message
                || 'Failed to place order. Please try again.';

            Alert.alert('Order Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#1A1A1A" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Location</Text>
                    <Text style={styles.sectionSubtitle}>Where should we bring your food?</Text>

                    <View style={[
                        styles.inputContainer,
                        focusedInput === 'address' && styles.inputContainerFocused
                    ]}>
                        <MapPin color={focusedInput === 'address' ? '#FF4500' : '#666'} size={20} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your location (e.g., South C, Next to Mosque)"
                            placeholderTextColor="#999"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            onFocus={() => setFocusedInput('address')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>KSh {subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>KSh {deliveryFee.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>KSh {total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Clicking "Place Order" will redirect you to WhatsApp to confirm details with the restaurant.
                    </Text>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.placeOrderText}>
                        {loading ? 'Processing...' : `Place Order`}
                    </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputContainerFocused: {
        borderColor: '#FF4500',
        backgroundColor: '#FFF5F2',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1A1A1A',
        minHeight: 24,
    },
    summaryCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    totalRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF4500',
    },
    infoBox: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        color: '#0D47A1',
        fontSize: 14,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    placeOrderButton: {
        backgroundColor: '#FF4500',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    placeOrderText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
