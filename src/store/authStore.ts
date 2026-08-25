import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../types/auth';
import { StorageKeys } from '../constants/storageKeys';

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
    await AsyncStorage.setItem(StorageKeys.token, token);
    await AsyncStorage.setItem(StorageKeys.refreshToken, refreshToken);
    await AsyncStorage.setItem(StorageKeys.user, JSON.stringify(user));
    set({ token, refreshToken, user });
  },

  logout: async () => {
    await AsyncStorage.multiRemove([
      StorageKeys.token,
      StorageKeys.refreshToken,
      StorageKeys.user,
    ]);
    set({ token: null, refreshToken: null, user: null });
  },

  hydrate: async () => {
    try {
      const [token, refreshToken, userStr] = await Promise.all([
        AsyncStorage.getItem(StorageKeys.token),
        AsyncStorage.getItem(StorageKeys.refreshToken),
        AsyncStorage.getItem(StorageKeys.user),
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
