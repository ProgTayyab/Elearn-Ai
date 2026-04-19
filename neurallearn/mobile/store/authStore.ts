import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser {
    id: number;
    email: string;
    name: string;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
    isLoading: boolean;
    login: (token: string, refreshToken: string, user: AuthUser) => Promise<void>;
    logout: () => Promise<void>;
    hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    refreshToken: null,
    user: null,
    isLoading: true,

    login: async (token, refreshToken, user) => {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        set({ token, refreshToken, user });
    },

    logout: async () => {
        await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        set({ token: null, refreshToken: null, user: null });
    },

    hydrate: async () => {
        try {
            const [token, refreshToken, userStr] = await Promise.all([
                AsyncStorage.getItem('token'),
                AsyncStorage.getItem('refreshToken'),
                AsyncStorage.getItem('user'),
            ]);
            set({
                token,
                refreshToken,
                user: userStr ? JSON.parse(userStr) : null,
                isLoading: false,
            });
        } catch {
            set({ isLoading: false });
        }
    },
}));
