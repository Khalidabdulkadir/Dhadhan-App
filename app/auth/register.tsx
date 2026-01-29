
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
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
                <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === 'ios' ? 20 : 150 }]}>
                    <View style={styles.content}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/images/icon.png')}
                                style={styles.logo}
                            />
                            <Text style={styles.appName}>Dhadhan</Text>
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join us to order delicious food</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedInput === 'email' && styles.inputFocused
                                    ]}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#999"
                                    value={formData.email}
                                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>First Name</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            focusedInput === 'first_name' && styles.inputFocused
                                        ]}
                                        placeholder="First name"
                                        placeholderTextColor="#999"
                                        value={formData.first_name}
                                        onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                                        onFocus={() => setFocusedInput('first_name')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Last Name</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            focusedInput === 'last_name' && styles.inputFocused
                                        ]}
                                        placeholder="Last name"
                                        placeholderTextColor="#999"
                                        value={formData.last_name}
                                        onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                                        onFocus={() => setFocusedInput('last_name')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password *</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        focusedInput === 'password' && styles.inputFocused
                                    ]}
                                    placeholder="Create a password"
                                    placeholderTextColor="#999"
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    secureTextEntry
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.button, loading && styles.buttonDisabled]}
                                onPress={handleRegister}
                                disabled={loading}
                                activeOpacity={0.8}
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
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 16,
        borderRadius: 20,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        letterSpacing: 0.5,
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    row: {
        flexDirection: 'row',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F3F4F6',
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        color: '#1A1A1A',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inputFocused: {
        borderColor: '#FF4500',
        backgroundColor: '#FFF5F2',
    },
    button: {
        backgroundColor: '#FF4500',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#FF4500',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
        marginTop: 24,
    },
    footerText: {
        color: '#666',
        fontSize: 15,
    },
    link: {
        color: '#FF4500',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
