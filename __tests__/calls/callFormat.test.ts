import {
  describeHistoryStatus,
  formatCallTimestamp,
  formatDuration,
  isOutgoing,
  otherParticipant,
  resolvePhotoUrl,
  roleLabel,
} from '../../src/features/calls/utils/callFormat';
import { endedMessage, issueMessage } from '../../src/features/calls/utils/callMessages';
import type { Call, CallStatus } from '../../src/features/calls/types/call.types';

function makeCall(status: CallStatus, overrides: Partial<Call> = {}): Call {
  return {
    id: 'call-1',
    callType: 'VOICE',
    status,
    conversationId: 'conversation-1',
    appointmentId: null,
    labBookingId: null,
    caller: { userId: 'u1', role: 'USER', name: 'Patient One', subtitle: null, photoUrl: null },
    receiver: { userId: 'u2', role: 'DOCTOR', name: 'Dr. Rao', subtitle: 'Cardiology', photoUrl: '/profile-photos/a.jpg' },
    startedAt: '2026-10-04T10:00:00Z',
    ringExpiresAt: '2026-10-04T10:00:45Z',
    acceptedAt: null,
    connectedAt: null,
    endedAt: null,
    durationSeconds: 0,
    endReason: null,
    createdAt: '2026-10-04T10:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
    ...overrides,
  };
}

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(3599)).toBe('59:59');
  });

  it('adds hours past one hour', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3725)).toBe('1:02:05');
  });

  it('clamps negative and fractional values', () => {
    expect(formatDuration(-5)).toBe('00:00');
    expect(formatDuration(9.9)).toBe('00:09');
  });
});

describe('participants', () => {
  it('returns the other side of the call', () => {
    const call = makeCall('ENDED');

    expect(otherParticipant(call, 'u1').name).toBe('Dr. Rao');
    expect(otherParticipant(call, 'u2').name).toBe('Patient One');
    expect(isOutgoing(call, 'u1')).toBe(true);
    expect(isOutgoing(call, 'u2')).toBe(false);
  });

  it('labels roles', () => {
    expect(roleLabel('DOCTOR')).toBe('Doctor');
    expect(roleLabel('LABORATORIAN')).toBe('Laboratory');
    expect(roleLabel('USER')).toBe('Patient');
  });
});

describe('describeHistoryStatus', () => {
  it('describes outgoing and incoming outcomes from the viewer perspective', () => {
    expect(describeHistoryStatus(makeCall('MISSED'), 'u1')).toEqual({ label: 'No answer', tone: 'warning' });
    expect(describeHistoryStatus(makeCall('MISSED'), 'u2')).toEqual({ label: 'Missed', tone: 'error' });
    expect(describeHistoryStatus(makeCall('REJECTED'), 'u1').label).toBe('Declined');
    expect(describeHistoryStatus(makeCall('REJECTED'), 'u2').label).toBe('You declined');
    expect(describeHistoryStatus(makeCall('CANCELLED'), 'u2')).toEqual({ label: 'Missed', tone: 'error' });
    expect(describeHistoryStatus(makeCall('ENDED'), 'u1').label).toBe('Outgoing');
    expect(describeHistoryStatus(makeCall('ENDED'), 'u2').label).toBe('Incoming');
    expect(describeHistoryStatus(makeCall('FAILED'), 'u1').tone).toBe('error');
  });
});

describe('formatCallTimestamp', () => {
  it('uses relative day names for today and yesterday', () => {
    const now = new Date(2026, 9, 4, 15, 0, 0);

    expect(formatCallTimestamp(new Date(2026, 9, 4, 9, 30).toISOString(), now)).toMatch(/^Today, /);
    expect(formatCallTimestamp(new Date(2026, 9, 3, 9, 30).toISOString(), now)).toMatch(/^Yesterday, /);
    expect(formatCallTimestamp(new Date(2026, 8, 20, 9, 30).toISOString(), now)).not.toMatch(/^(Today|Yesterday)/);
  });
});

describe('resolvePhotoUrl', () => {
  it('prefixes relative asset paths and leaves absolute urls alone', () => {
    expect(resolvePhotoUrl('/profile-photos/a.jpg', 'https://api.example.com')).toBe('https://api.example.com/profile-photos/a.jpg');
    expect(resolvePhotoUrl('https://cdn.example.com/a.jpg', 'https://api.example.com')).toBe('https://cdn.example.com/a.jpg');
    expect(resolvePhotoUrl(null, 'https://api.example.com')).toBeNull();
  });
});

describe('call messages', () => {
  it('never leaks technical details to the user', () => {
    expect(issueMessage('connection_failed')).not.toMatch(/agora|error code|token/i);
    expect(issueMessage('token_failed')).not.toMatch(/agora|jwt|expired/i);
    expect(issueMessage('permission_denied')).toMatch(/microphone/i);
  });

  it('describes how a call ended for each side', () => {
    expect(endedMessage(makeCall('MISSED'), 'u1')).toBe('No answer');
    expect(endedMessage(makeCall('MISSED'), 'u2')).toBe('Missed call');
    expect(endedMessage(makeCall('REJECTED'), 'u1')).toBe('Call declined');
    expect(endedMessage(makeCall('ENDED', { endReason: 'NETWORK_FAILURE' }), 'u1')).toMatch(/poor connection/);
    expect(endedMessage(makeCall('ENDED'), 'u1')).toBe('Call ended');
  });
});
