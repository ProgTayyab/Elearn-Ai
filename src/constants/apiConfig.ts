import { Platform } from 'react-native';

/** LAN IP of the machine running the API (physical devices cannot use localhost). */
const LAN_HOST = '192.168.100.9';
const API_HOST = Platform.OS === 'web' ? 'localhost' : LAN_HOST;

export const ApiConfig = {
  baseUrl: `http://${API_HOST}:3000/api`,
  timeoutMs: 10000,
} as const;
