import { callReducer, initialCallState, isTerminalStatus, type CallState } from '../../src/features/calls/state/callReducer';
import type { Call, CallStatus } from '../../src/features/calls/types/call.types';

const CALLER_ID = 'caller-1';
const RECEIVER_ID = 'receiver-1';

function makeCall(status: CallStatus = 'RINGING', overrides: Partial<Call> = {}): Call {
  return {
    id: 'call-1',
    callType: 'VIDEO',
    status,
    appointmentId: 'appointment-1',
    meetingId: 'meeting-1',
    caller: { userId: CALLER_ID, role: 'USER', name: 'Patient One', subtitle: null, photoUrl: null },
    receiver: { userId: RECEIVER_ID, role: 'DOCTOR', name: 'Dr. Rao', subtitle: 'Cardiology', photoUrl: null },
    startedAt: '2026-10-04T10:00:00Z',
    ringingAt: '2026-10-04T10:00:00Z',
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

describe('callReducer', () => {
  describe('incoming', () => {
    it('shows a ringing call to an idle receiver', () => {
      const state = callReducer(initialCallState, { type: 'incoming', call: makeCall() });

      expect(state.stage).toBe('incoming');
      expect(state.role).toBe('RECEIVER');
    });

    it('ignores an incoming call while another call is in progress', () => {
      const busy = callReducer(initialCallState, { type: 'outgoingStarted', call: makeCall() });

      const state = callReducer(busy, { type: 'incoming', call: makeCall('RINGING', { id: 'call-2' }) });

      expect(state).toBe(busy);
    });

    it('ignores an incoming call that is no longer ringing', () => {
      const state = callReducer(initialCallState, { type: 'incoming', call: makeCall('MISSED') });

      expect(state).toBe(initialCallState);
    });
  });

  describe('outgoingStarted', () => {
    it('puts the caller in the outgoing stage with the call', () => {
      const state = callReducer(initialCallState, { type: 'outgoingStarted', call: makeCall() });

      expect(state.stage).toBe('outgoing');
      expect(state.role).toBe('CALLER');
    });

    it('cannot start while a call is already active', () => {
      const first = callReducer(initialCallState, { type: 'outgoingStarted', call: makeCall() });

      const second = callReducer(first, { type: 'outgoingStarted', call: makeCall('RINGING', { id: 'call-2' }) });

      expect(second).toBe(first);
    });
  });

  describe('accepted', () => {
    it('moves an incoming call to active', () => {
      const incoming = callReducer(initialCallState, { type: 'incoming', call: makeCall() });

      const state = callReducer(incoming, { type: 'accepted', call: makeCall('ACCEPTED') });

      expect(state.stage).toBe('active');
      expect(state.role).toBe('RECEIVER');
    });

    it('ignores acceptance for a different call', () => {
      const incoming = callReducer(initialCallState, { type: 'incoming', call: makeCall() });

      const state = callReducer(incoming, {
        type: 'accepted',
        call: makeCall('ACCEPTED', { id: 'other' }),
      });

      expect(state).toBe(incoming);
    });

    it('ignores acceptance when nothing is incoming', () => {
      const state = callReducer(initialCallState, { type: 'accepted', call: makeCall('ACCEPTED') });

      expect(state).toBe(initialCallState);
    });
  });

  describe('resumed', () => {
    it('resumes a connected call as caller or receiver based on the user id', () => {
      const asCaller = callReducer(initialCallState, { type: 'resumed', call: makeCall('CONNECTED'), userId: CALLER_ID });
      const asReceiver = callReducer(initialCallState, { type: 'resumed', call: makeCall('CONNECTED'), userId: RECEIVER_ID });

      expect(asCaller.role).toBe('CALLER');
      expect(asCaller.stage).toBe('active');
      expect(asReceiver.role).toBe('RECEIVER');
    });

    it('resumes a ringing call as outgoing for the caller and incoming for the receiver', () => {
      const asCaller = callReducer(initialCallState, { type: 'resumed', call: makeCall('RINGING'), userId: CALLER_ID });
      const asReceiver = callReducer(initialCallState, { type: 'resumed', call: makeCall('RINGING'), userId: RECEIVER_ID });

      expect(asCaller.stage).toBe('outgoing');
      expect(asReceiver.stage).toBe('incoming');
    });

    it('does not replace a call that is already tracked', () => {
      const current = callReducer(initialCallState, { type: 'outgoingStarted', call: makeCall() });

      const state = callReducer(current, { type: 'resumed', call: makeCall('CONNECTED'), userId: CALLER_ID });

      expect(state).toBe(current);
    });
  });

  describe('callUpdated', () => {
    const active = (): CallState => {
      const incoming = callReducer(initialCallState, { type: 'incoming', call: makeCall() });
      return callReducer(incoming, { type: 'accepted', call: makeCall('ACCEPTED') });
    };

    it('tracks status changes of the current call', () => {
      const state = callReducer(active(), { type: 'callUpdated', call: makeCall('CONNECTED', { connectedAt: '2026-10-04T10:00:09Z' }) });

      expect(state.stage).toBe('active');
      expect(state.call?.connectedAt).toBe('2026-10-04T10:00:09Z');
    });

    it.each<CallStatus>(['ENDED', 'REJECTED', 'CANCELLED', 'MISSED', 'FAILED'])('moves to ended when the server reports %s', (status) => {
      const state = callReducer(active(), { type: 'callUpdated', call: makeCall(status) });

      expect(state.stage).toBe('ended');
    });

    it('ignores updates for another call', () => {
      const current = active();

      const state = callReducer(current, { type: 'callUpdated', call: makeCall('ENDED', { id: 'other' }) });

      expect(state).toBe(current);
    });

    it('never reopens a call that already ended', () => {
      const ended = callReducer(active(), { type: 'callUpdated', call: makeCall('ENDED') });

      const state = callReducer(ended, { type: 'callUpdated', call: makeCall('CONNECTED') });

      expect(state).toBe(ended);
      expect(state.stage).toBe('ended');
    });

    it('allows a terminal update to enrich an already ended call', () => {
      const ended = callReducer(active(), { type: 'callUpdated', call: makeCall('ENDED') });

      const state = callReducer(ended, { type: 'callUpdated', call: makeCall('ENDED', { durationSeconds: 95, endReason: 'HANGUP' }) });

      expect(state.call?.durationSeconds).toBe(95);
      expect(state.stage).toBe('ended');
    });

    it('does nothing when there is no current call', () => {
      const state = callReducer(initialCallState, { type: 'callUpdated', call: makeCall('ENDED') });

      expect(state).toBe(initialCallState);
    });

    it('treats a cancelled incoming call as ended so the incoming screen can close', () => {
      const incoming = callReducer(initialCallState, { type: 'incoming', call: makeCall() });

      const state = callReducer(incoming, { type: 'callUpdated', call: makeCall('CANCELLED') });

      expect(state.stage).toBe('ended');
    });
  });

  describe('reset', () => {
    it('returns to the idle state', () => {
      const started = callReducer(initialCallState, { type: 'outgoingStarted', call: makeCall() });

      expect(callReducer(started, { type: 'reset' })).toEqual(initialCallState);
    });
  });

  describe('isTerminalStatus', () => {
    it('identifies terminal statuses', () => {
      expect(isTerminalStatus('ENDED')).toBe(true);
      expect(isTerminalStatus('MISSED')).toBe(true);
      expect(isTerminalStatus('RINGING')).toBe(false);
      expect(isTerminalStatus('CONNECTED')).toBe(false);
    });
  });
});
