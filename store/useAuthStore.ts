
import api from '@/constants/api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    googleLogin: (token: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (username, password) => {
        try {
            const response = await api.post('/auth/login/', { username, password });
            const { access, refresh } = response.data;

            if (Platform.OS !== 'web') {
                await SecureStore.setItemAsync('accessToken', access);
                await SecureStore.setItemAsync('refreshToken', refresh);
            } else {
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);
            }

            // Fetch user profile
            const profileResponse = await api.get('/auth/profile/');
            set({ user: profileResponse.data, isAuthenticated: true });
        } catch (error) {
            throw error;
        }
    },

    googleLogin: async (token: string) => {
        try {
            const response = await api.post('/auth/google/', { token });
            const { access, refresh, user } = response.data;

            if (Platform.OS !== 'web') {
                await SecureStore.setItemAsync('accessToken', access);
                await SecureStore.setItemAsync('refreshToken', refresh);
            } else {
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);
            }

            set({ user, isAuthenticated: true });
        } catch (error) {
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register/', userData);
            const { access, refresh, user } = response.data;

            if (Platform.OS !== 'web') {
                await SecureStore.setItemAsync('accessToken', access);
                await SecureStore.setItemAsync('refreshToken', refresh);
            } else {
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);
            }

            set({ user, isAuthenticated: true });
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        if (Platform.OS !== 'web') {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        try {
            let token;
            if (Platform.OS !== 'web') {
                token = await SecureStore.getItemAsync('accessToken');
            } else {
                token = localStorage.getItem('accessToken');
            }

            if (token) {
                const response = await api.get('/auth/profile/');
                set({ user: response.data, isAuthenticated: true });
            } else {
                set({ user: null, isAuthenticated: false });
            }
        } catch (error) {
            // Token might be invalid
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },
}));
