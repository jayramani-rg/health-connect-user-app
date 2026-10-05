import type { Call, CallRole, CallSession, CallStage, CallStatus, RtcSession } from '../types/call.types';

export interface CallState {
  stage: CallStage;
  role: CallRole | null;
  call: Call | null;
  rtc: RtcSession | null;
}

export type CallAction =
  | { type: 'incoming'; call: Call }
  | { type: 'outgoingStarted'; session: CallSession }
  | { type: 'accepted'; session: CallSession }
  | { type: 'resumed'; session: CallSession; userId: string }
  | { type: 'callUpdated'; call: Call }
  | { type: 'tokenRefreshed'; rtc: RtcSession }
  | { type: 'reset' };

export const initialCallState: CallState = {
  stage: 'idle',
  role: null,
  call: null,
  rtc: null,
};

const TERMINAL_STATUSES: CallStatus[] = ['ENDED', 'REJECTED', 'CANCELLED', 'MISSED', 'FAILED'];

export function isTerminalStatus(status: CallStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

function stageFor(call: Call, role: CallRole): CallStage {
  if (isTerminalStatus(call.status)) {
    return 'ended';
  }
  if (call.status === 'RINGING') {
    return role === 'CALLER' ? 'outgoing' : 'incoming';
  }
  return 'active';
}

export function callReducer(state: CallState, action: CallAction): CallState {
  switch (action.type) {
    case 'incoming': {
      if (state.stage !== 'idle' || action.call.status !== 'RINGING') {
        return state;
      }
      return { stage: 'incoming', role: 'RECEIVER', call: action.call, rtc: null };
    }

    case 'outgoingStarted': {
      if (state.stage !== 'idle') {
        return state;
      }
      return { stage: stageFor(action.session.call, 'CALLER'), role: 'CALLER', call: action.session.call, rtc: action.session.rtc };
    }

    case 'accepted': {
      if (state.stage !== 'incoming' || state.call?.id !== action.session.call.id) {
        return state;
      }
      return { stage: stageFor(action.session.call, 'RECEIVER'), role: 'RECEIVER', call: action.session.call, rtc: action.session.rtc };
    }

    case 'resumed': {
      if (state.stage !== 'idle') {
        return state;
      }
      const role: CallRole = action.session.call.caller.userId === action.userId ? 'CALLER' : 'RECEIVER';
      return { stage: stageFor(action.session.call, role), role, call: action.session.call, rtc: action.session.rtc };
    }

    case 'callUpdated': {
      if (!state.call || state.call.id !== action.call.id || !state.role) {
        return state;
      }
      if (isTerminalStatus(state.call.status) && !isTerminalStatus(action.call.status)) {
        return state;
      }
      return { ...state, stage: stageFor(action.call, state.role), call: action.call };
    }

    case 'tokenRefreshed': {
      if (!state.rtc || state.rtc.callId !== action.rtc.callId) {
        return state;
      }
      return { ...state, rtc: action.rtc };
    }

    case 'reset':
      return initialCallState;

    default:
      return state;
  }
}
