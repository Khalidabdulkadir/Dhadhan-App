
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'expo-router';
import { ChevronRight, Clock, LogOut, MapPin, Settings } from 'lucide-react-native';
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
                    <Text style={styles.title}>Not Logged In</Text>
                    <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/login' as any)}>
                        <Text style={styles.buttonText}>Sign In</Text>
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

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Settings size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Account</Text>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <MapPin size={20} color="#FF4500" />
                        </View>
                        <Text style={styles.menuText}>Saved Addresses</Text>
                        <ChevronRight size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Clock size={20} color="#FF4500" />
                        </View>
                        <Text style={styles.menuText}>Order History</Text>
                        <ChevronRight size={20} color="#CCC" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={styles.menuIcon}>
                            <LogOut size={20} color="#FF4500" />
                        </View>
                        <Text style={[styles.menuText, { color: '#FF4500' }]}>Log Out</Text>
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
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#FF4500',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    buttonText: {
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
    content: {
        padding: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
        elevation: 2,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF4500',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    editButton: {
        padding: 10,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginLeft: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        elevation: 1,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F2',
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
