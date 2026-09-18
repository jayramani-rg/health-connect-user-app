import { Platform } from 'react-native';
import { API_BASE_URL as CONFIGURED_API_BASE_URL } from '@env';

function resolveApiBaseUrl(): string {
  if (CONFIGURED_API_BASE_URL.includes('localhost')) {
    const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return CONFIGURED_API_BASE_URL.replace('localhost', host);
  }
  return CONFIGURED_API_BASE_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const REQUEST_TIMEOUT_MS = 20000;

/** Same host as API_BASE_URL (already host-substituted for the Android emulator/ngrok cases above),
 * just swapping the /api REST prefix for the SignalR hub path. */
export const SIGNALR_HUB_URL = `${API_BASE_URL.replace(/\/api\/?$/, '')}/hubs/chat`;
