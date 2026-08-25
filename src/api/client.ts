gitimport axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ApiConfig } from '../constants/apiConfig';

const api = axios.create({
  baseURL: ApiConfig.baseUrl,
  timeout: ApiConfig.timeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { refreshToken, login } = useAuthStore.getState();
        if (refreshToken) {
          const { data } = await axios.post(`${ApiConfig.baseUrl}/auth/refresh`, {
            refreshToken,
          });
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
