
import api from '@/constants/api';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useOrderStore } from '@/store/useOrderStore';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Store, Truck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCartStore();
    const { setStatus } = useOrderStore();
    const { isAuthenticated } = useAuthStore();

    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('mpesa');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const subtotal = getTotal();
    const deliveryFee = deliveryMethod === 'delivery' ? 500 : 0; // 500 KES delivery
    const total = subtotal + deliveryFee;

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            Alert.alert('Login Required', 'Please login to place an order', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login', onPress: () => router.push('/auth/login' as any) }
            ]);
            return;
        }

        if (deliveryMethod === 'delivery' && !address) {
            Alert.alert('Error', 'Please enter your delivery address');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                items: items.map(item => ({ id: item.id, quantity: item.quantity })),
                total_amount: total,
                delivery_address: deliveryMethod === 'delivery' ? address : 'Pickup',
                payment_method: paymentMethod,
                phone_number: paymentMethod === 'mpesa' ? `254${phoneNumber}` : '',
                status: 'received'
            };

            await api.post('/orders/', orderData);

            setStatus('received');
            clearCart();
            router.replace('/tracking');
        } catch (error) {
            console.error('Order failed:', error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#333" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Delivery Method</Text>
                <View style={styles.methodContainer}>
                    <TouchableOpacity
                        style={[styles.methodCard, deliveryMethod === 'delivery' && styles.activeMethodCard]}
                        onPress={() => setDeliveryMethod('delivery')}
                    >
                        <Truck color={deliveryMethod === 'delivery' ? '#FFF' : '#666'} size={24} />
                        <Text style={[styles.methodText, deliveryMethod === 'delivery' && styles.activeMethodText]}>Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.methodCard, deliveryMethod === 'pickup' && styles.activeMethodCard]}
                        onPress={() => setDeliveryMethod('pickup')}
                    >
                        <Store color={deliveryMethod === 'pickup' ? '#FFF' : '#666'} size={24} />
                        <Text style={[styles.methodText, deliveryMethod === 'pickup' && styles.activeMethodText]}>Pickup</Text>
                    </TouchableOpacity>
                </View>

                {deliveryMethod === 'delivery' && (
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Delivery Address</Text>
                        <View style={styles.inputContainer}>
                            <MapPin color="#666" size={20} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your address"
                                value={address}
                                onChangeText={setAddress}
                                multiline
                            />
                        </View>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentContainer}>
                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'mpesa' && styles.activePaymentOption]}
                        onPress={() => setPaymentMethod('mpesa')}
                    >
                        <View style={styles.radioOuter}>
                            {paymentMethod === 'mpesa' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.paymentText}>M-Pesa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.paymentOption, paymentMethod === 'cash' && styles.activePaymentOption]}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <View style={styles.radioOuter}>
                            {paymentMethod === 'cash' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={styles.paymentText}>Cash on Delivery</Text>
                    </TouchableOpacity>
                </View>

                {paymentMethod === 'mpesa' && (
                    <View style={styles.inputSection}>
                        <Text style={styles.label}>M-Pesa Phone Number</Text>
                        <View style={styles.inputContainer}>
                            <Text style={{ marginRight: 10, color: '#333' }}>+254</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="712345678"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                maxLength={9}
                            />
                        </View>
                    </View>
                )}

                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
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
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    <Text style={styles.placeOrderText}>
                        {loading ? 'Processing...' : `Place Order - KSh ${total.toFixed(2)}`}
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
        padding: 20,
        backgroundColor: '#FFF',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginTop: 10,
    },
    methodContainer: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    methodCard: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    activeMethodCard: {
        backgroundColor: '#FF4500',
        borderColor: '#FF4500',
    },
    methodText: {
        marginTop: 10,
        fontWeight: '600',
        color: '#666',
    },
    activeMethodText: {
        color: '#FFF',
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    paymentContainer: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 10,
        marginBottom: 20,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    activePaymentOption: {
        backgroundColor: '#FFF5F2',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#FF4500',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF4500',
    },
    paymentText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    summarySection: {
        marginTop: 10,
        marginBottom: 100,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 15,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#666',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF4500',
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    placeOrderButton: {
        backgroundColor: '#FF4500',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
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
