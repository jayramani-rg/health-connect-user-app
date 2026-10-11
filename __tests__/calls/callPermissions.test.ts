import { check, request } from 'react-native-permissions';
import { ensureCallReadiness, requestCallPermissions } from '../../src/features/calls/permissions/callPermissions';

jest.mock('react-native-permissions', () => ({
  check: jest.fn(),
  request: jest.fn(),
  openSettings: jest.fn(() => Promise.resolve()),
  PERMISSIONS: {
    ANDROID: {
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
      CAMERA: 'android.permission.CAMERA',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
    },
    IOS: { MICROPHONE: 'ios.permission.MICROPHONE', CAMERA: 'ios.permission.CAMERA' },
  },
  RESULTS: { GRANTED: 'granted', DENIED: 'denied', BLOCKED: 'blocked', UNAVAILABLE: 'unavailable', LIMITED: 'limited' },
}));

const checkMock = check as jest.Mock;
const requestMock = request as jest.Mock;

function requestedPermissions(): string[] {
  return [...checkMock.mock.calls, ...requestMock.mock.calls].map((args) => String(args[0]));
}

beforeEach(() => {
  checkMock.mockReset();
  requestMock.mockReset();
  checkMock.mockResolvedValue('denied');
  requestMock.mockResolvedValue('granted');
});

describe('call permissions', () => {
  it('never checks or requests camera permission for a voice call', async () => {
    const result = await requestCallPermissions('VOICE');

    expect(result.microphone).toBe('granted');
    expect(requestedPermissions().some((permission) => /CAMERA/i.test(permission))).toBe(false);
    expect(requestedPermissions().some((permission) => /RECORD_AUDIO|MICROPHONE/i.test(permission))).toBe(true);
  });

  it('requests microphone and camera for a video call', async () => {
    const result = await requestCallPermissions('VIDEO');

    expect(result).toEqual({ microphone: 'granted', camera: 'granted' });
    expect(requestedPermissions().some((permission) => /CAMERA/i.test(permission))).toBe(true);
  });

  it('lets a voice call proceed without the camera being allowed', async () => {
    const readiness = await ensureCallReadiness('VOICE');

    expect(readiness).toEqual({ canCall: true, cameraAllowed: false });
    expect(requestedPermissions().some((permission) => /CAMERA/i.test(permission))).toBe(false);
  });

  it('allows the camera on a video call once granted', async () => {
    const readiness = await ensureCallReadiness('VIDEO');

    expect(readiness).toEqual({ canCall: true, cameraAllowed: true });
  });

  it('degrades a video call to audio only when the camera is denied', async () => {
    requestMock.mockImplementation(async (permission: string) => (/CAMERA/i.test(permission) ? 'denied' : 'granted'));

    const readiness = await ensureCallReadiness('VIDEO');

    expect(readiness).toEqual({ canCall: true, cameraAllowed: false });
  });

  it('blocks the call when the microphone is denied', async () => {
    requestMock.mockResolvedValue('denied');

    const readiness = await ensureCallReadiness('VOICE');

    expect(readiness.canCall).toBe(false);
  });
});
