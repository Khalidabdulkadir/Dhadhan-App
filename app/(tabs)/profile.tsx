
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, LogOut, MessageCircle, User } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/auth/login' as any);
                }
            }
        ]);
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <View style={styles.iconContainer}>
                        <User size={50} color="#DDD" />
                    </View>
                    <Text style={styles.title}>Not Logged In</Text>
                    <Text style={styles.subtitle}>Sign in to view your profile and orders</Text>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login' as any)}>
                        <Text style={styles.buttonText}>Sign In / Register</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Gold Member</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activity</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/orders' as any)}>
                        <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
                            <Clock size={20} color="#4CAF50" />
                        </View>
                        <Text style={styles.menuText}>Order History</Text>
                        <ChevronRight size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: '#E0F2F1' }]}>
                            <MessageCircle size={20} color="#009688" />
                        </View>
                        <Text style={styles.menuText}>WhatsApp Orders</Text>
                        <ChevronRight size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
                            <LogOut size={20} color="#F44336" />
                        </View>
                        <Text style={[styles.menuText, { color: '#F44336' }]}>Log Out</Text>
                    </TouchableOpacity>
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#FF4500',
        paddingHorizontal: 40,
        paddingVertical: 18,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 25,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    content: {
        padding: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 25,
        borderRadius: 25,
        marginBottom: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FF4500',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    badge: {
        backgroundColor: '#FFF9C4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#FBC02D',
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 15,
        marginLeft: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});
