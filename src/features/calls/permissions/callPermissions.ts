import { Alert, Linking, Platform } from 'react-native';
import { check, openSettings, PERMISSIONS, request, RESULTS, type Permission, type PermissionStatus } from 'react-native-permissions';
import type { CallType } from '../types/call.types';

export type CallPermissionState = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface CallPermissionResult {
  microphone: CallPermissionState;
  camera: CallPermissionState;
}

const MICROPHONE: Permission = Platform.select({
  ios: PERMISSIONS.IOS.MICROPHONE,
  default: PERMISSIONS.ANDROID.RECORD_AUDIO,
});

const CAMERA: Permission = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  default: PERMISSIONS.ANDROID.CAMERA,
});

function toState(status: PermissionStatus): CallPermissionState {
  switch (status) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.UNAVAILABLE:
      return 'unavailable';
    default:
      return 'denied';
  }
}

async function ensure(permission: Permission): Promise<CallPermissionState> {
  try {
    const current = await check(permission);
    if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) {
      return 'granted';
    }
    if (current === RESULTS.BLOCKED || current === RESULTS.UNAVAILABLE) {
      return toState(current);
    }
    return toState(await request(permission));
  } catch {
    return 'denied';
  }
}

async function requestBluetoothAccess(): Promise<void> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 31) {
    return;
  }
  try {
    await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
  } catch {}
}

export async function requestCallPermissions(callType: CallType): Promise<CallPermissionResult> {
  const microphone = await ensure(MICROPHONE);
  const camera = callType === 'VIDEO' ? await ensure(CAMERA) : 'granted';
  await requestBluetoothAccess();
  return { microphone, camera };
}

function promptForSettings(title: string, message: string, blocked: boolean): void {
  const buttons = blocked
    ? [
        { text: 'Not now', style: 'cancel' as const },
        { text: 'Open settings', onPress: () => openSettings().catch(() => Linking.openSettings()) },
      ]
    : [{ text: 'OK' }];
  Alert.alert(title, message, buttons);
}

export interface CallReadiness {
  canCall: boolean;
  cameraAllowed: boolean;
}

export async function ensureCallReadiness(callType: CallType): Promise<CallReadiness> {
  const result = await requestCallPermissions(callType);

  if (result.microphone !== 'granted') {
    promptForSettings(
      'Microphone access needed',
      'Allow microphone access so the other person can hear you during the call.',
      result.microphone === 'blocked',
    );
    return { canCall: false, cameraAllowed: false };
  }

  if (callType === 'VIDEO' && result.camera !== 'granted') {
    promptForSettings(
      'Camera is off',
      'Camera access is not allowed, so you will join with audio only. You can turn it on later in Settings.',
      result.camera === 'blocked',
    );
    return { canCall: true, cameraAllowed: false };
  }

  return { canCall: true, cameraAllowed: callType === 'VIDEO' };
}
