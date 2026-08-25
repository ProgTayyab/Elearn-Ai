import { create } from 'zustand';
import { AuthUser } from '../types';
import api from '../api/client';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (token, refreshToken, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, refreshToken, user, isAuthenticated: true, isLoading: false });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  fetchCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    const user = data.user as AuthUser;
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    const refreshToken = get().refreshToken ?? localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Clear local session even if API fails
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  hydrate: async () => {
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (!token) {
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      set({
        token,
        refreshToken,
        user: userStr ? (JSON.parse(userStr) as AuthUser) : null,
        isAuthenticated: true,
      });

      await get().fetchCurrentUser();
    } catch {
      await get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
}));
