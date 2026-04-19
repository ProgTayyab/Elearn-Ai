import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Change this to your machine's IP if running on a physical device
const BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401, attempt token refresh or log out
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const { refreshToken, login, logout } = useAuthStore.getState();
                if (refreshToken) {
                    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
                    const user = useAuthStore.getState().user!;
                    await login(data.accessToken, data.refreshToken, user);
                    original.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(original);
                }
            } catch {
                useAuthStore.getState().logout();
            }
        }
        return Promise.reject(error);
    }
);

export default api;
