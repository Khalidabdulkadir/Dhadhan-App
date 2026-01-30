import { useAuthStore } from '@/store/useAuthStore';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(username, password);
            router.replace('/(tabs)' as any);
        } catch (error: any) {
            const message = error.response?.data?.detail || error.response?.data?.message || 'Invalid credentials or connection error.';
            Alert.alert('Login Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'center' }}
            >
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/icon4.png')}
                            style={styles.logo}
                        />
                    </View>

                    <View style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedInput === 'username' && styles.inputFocused
                                ]}
                                placeholder="Enter your email"
                                placeholderTextColor="#999"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onFocus={() => setFocusedInput('username')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    focusedInput === 'password' && styles.inputFocused
                                ]}
                                placeholder="Enter your password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <Link href={"/auth/register" as any} asChild>
                                <TouchableOpacity>
                                    <Text style={styles.link}>Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    content: {
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 16,
        borderRadius: 20,
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
