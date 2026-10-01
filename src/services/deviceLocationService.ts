// One-shot, approximate device location → locality. No watchers, no background tracking: a single coarse
// fix (cached up to 10 min by the OS) is reverse-geocoded and only the area-level result is kept. Every
// failure resolves to a typed outcome instead of throwing, so callers can simply "carry on without location".

import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { LocationLookupError, reverseGeocode, type ResolvedLocation } from './googleLocationService';

export type DeviceLocationOutcome =
  | { status: 'ok'; location: ResolvedLocation }
  | { status: 'denied' }
  | { status: 'blocked' }
  | { status: 'services_off' }
  | { status: 'timeout' }
  | { status: 'lookup_failed'; message: string };

export type PermissionOutcome = 'granted' | 'denied' | 'blocked';

Geolocation.setRNConfiguration({
  // We ask ourselves (below) so the OS dialog only ever appears after the user tapped "Enable location".
  skipPermissionRequests: true,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

export async function checkLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
    } catch {
      return false;
    }
  }
  // iOS has no silent check through this module; the persisted status in the store is the source of truth.
  return false;
}

export async function requestLocationPermission(): Promise<PermissionOutcome> {
  if (Platform.OS === 'android') {
    try {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
        title: 'Find care near you',
        message: 'Allow approximate location to see doctors and labs in your area first. You can keep using the app without it.',
        buttonPositive: 'Allow',
        buttonNegative: 'Not now',
      });
      if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
      return 'denied';
    } catch {
      return 'denied';
    }
  }

  return new Promise((resolve) => {
    Geolocation.requestAuthorization(
      () => resolve('granted'),
      (error) => resolve(error?.code === 1 ? 'blocked' : 'denied'),
    );
  });
}

function getCoarsePosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

/** Assumes permission was already granted. */
export async function detectCurrentLocality(): Promise<DeviceLocationOutcome> {
  let coords: { latitude: number; longitude: number };
  try {
    coords = await getCoarsePosition();
  } catch (error) {
    const code = (error as { code?: number } | undefined)?.code;
    if (code === 1) return { status: 'denied' };
    if (code === 3) return { status: 'timeout' };
    // 2 = POSITION_UNAVAILABLE (location services off / no provider) and anything unexpected.
    return { status: 'services_off' };
  }

  try {
    const location = await reverseGeocode(coords.latitude, coords.longitude);
    if (!location) return { status: 'lookup_failed', message: "We couldn't work out your area." };
    return { status: 'ok', location };
  } catch (error) {
    return { status: 'lookup_failed', message: error instanceof LocationLookupError ? error.message : "We couldn't work out your area." };
  }
}
