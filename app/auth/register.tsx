
import { useAuthStore } from '@/store/useAuthStore';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const router = useRouter();
    const register = useAuthStore((state) => state.register);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            await register(formData);
            Alert.alert('Success', 'Account created successfully', [
                { text: 'OK', onPress: () => router.replace('/(tabs)' as any) }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === 'ios' ? 20 : 100 }]}>
                    <View style={styles.headerContainer}>
                        <Image
                            source={{ uri: 'https://img.freepik.com/premium-vector/restaurant-logo-design-template_79169-56.jpg' }}
                            style={styles.logo}
                        />
                        <Text style={styles.title}>Matrix Restaurant</Text>
                        <Text style={styles.subtitle}>Create your account</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your first name"
                            value={formData.first_name}
                            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                        />

                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your last name"
                            value={formData.last_name}
                            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                        />

                        <Text style={styles.label}>Password *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href={"/auth/login" as any} asChild>
                                <TouchableOpacity>
                                    <Text style={styles.link}>Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    content: {
        padding: 20,
        paddingTop: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#FF4500',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    link: {
        color: '#FF4500',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
