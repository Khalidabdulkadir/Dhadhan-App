
import { OrderStatus, useOrderStore } from '@/store/useOrderStore';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check, Clock, Home, Package, Truck } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STEPS: { status: OrderStatus; label: string; icon: any; description: string }[] = [
    { status: 'received', label: 'Order Received', icon: Package, description: 'We have received your order.' },
    { status: 'preparing', label: 'Preparing', icon: Clock, description: 'Your food is being prepared.' },
    { status: 'ready', label: 'Ready', icon: Check, description: 'Your order is ready for pickup/delivery.' },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, description: 'Rider is on the way.' },
    { status: 'delivered', label: 'Delivered', icon: Home, description: 'Enjoy your meal!' },
];

export default function TrackingScreen() {
    const router = useRouter();
    const { status, setStatus } = useOrderStore();

    useEffect(() => {
        // Simulate status updates
        const interval = setInterval(() => {
            const currentStatus = useOrderStore.getState().status;
            const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);
            if (currentIndex < STEPS.length - 1) {
                setStatus(STEPS[currentIndex + 1].status);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [setStatus]);

    const getCurrentStepIndex = () => STEPS.findIndex((s) => s.status === status);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
                    <ArrowLeft color="#333" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Order</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapText}>Map View Placeholder</Text>
                </View>

                <View style={styles.timelineContainer}>
                    <Text style={styles.estimatedTime}>Estimated Delivery: 40-55 min</Text>

                    <View style={styles.timeline}>
                        {STEPS.map((step, index) => {
                            const isActive = index <= getCurrentStepIndex();
                            const isLast = index === STEPS.length - 1;
                            const Icon = step.icon;

                            return (
                                <View key={step.status} style={styles.stepRow}>
                                    <View style={styles.stepIndicator}>
                                        <View style={[styles.dot, isActive && styles.activeDot]}>
                                            {isActive && <Icon size={12} color="#FFF" />}
                                        </View>
                                        {!isLast && <View style={[styles.line, isActive && styles.activeLine]} />}
                                    </View>
                                    <View style={styles.stepContent}>
                                        <Text style={[styles.stepLabel, isActive && styles.activeLabel]}>{step.label}</Text>
                                        <Text style={styles.stepDesc}>{step.description}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
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
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#E0E0E0',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    mapText: {
        color: '#888',
        fontWeight: 'bold',
    },
    timelineContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        elevation: 2,
    },
    estimatedTime: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    timeline: {
        paddingLeft: 10,
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: 25,
    },
    stepIndicator: {
        alignItems: 'center',
        marginRight: 15,
    },
    dot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    activeDot: {
        backgroundColor: '#FF4500',
    },
    line: {
        width: 2,
        height: 40,
        backgroundColor: '#E0E0E0',
        position: 'absolute',
        top: 24,
    },
    activeLine: {
        backgroundColor: '#FF4500',
    },
    stepContent: {
        flex: 1,
    },
    stepLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 4,
    },
    activeLabel: {
        color: '#333',
    },
    stepDesc: {
        fontSize: 12,
        color: '#888',
    },
});
