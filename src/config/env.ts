import { Platform } from 'react-native';
import { API_BASE_URL as CONFIGURED_API_BASE_URL, GOOGLE_API_KEY as CONFIGURED_GOOGLE_API_KEY } from '@env';

function resolveApiBaseUrl(): string {
  if (CONFIGURED_API_BASE_URL.includes('localhost')) {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return CONFIGURED_API_BASE_URL.replace('localhost', host);
  }
  return CONFIGURED_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const REQUEST_TIMEOUT_MS = 20000;

export const SIGNALR_HUB_URL = `${API_BASE_URL.replace(/\/api\/?$/, '')}/hubs/chat`;

export const ASSETS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export const GOOGLE_API_KEY: string = (CONFIGURED_GOOGLE_API_KEY ?? '').trim();
