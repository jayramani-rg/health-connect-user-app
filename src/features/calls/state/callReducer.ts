import type { Call, CallRole, CallStage, CallStatus } from '../types/call.types';

export interface CallState {
  stage: CallStage;
  role: CallRole | null;
  call: Call | null;
}

export type CallAction =
  | { type: 'incoming'; call: Call }
  | { type: 'outgoingStarted'; call: Call }
  | { type: 'accepted'; call: Call }
  | { type: 'resumed'; call: Call; userId: string }
  | { type: 'callUpdated'; call: Call }
  | { type: 'reset' };

export const initialCallState: CallState = {
  stage: 'idle',
  role: null,
  call: null,
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
      return { stage: 'incoming', role: 'RECEIVER', call: action.call };
    }

    case 'outgoingStarted': {
      if (state.stage !== 'idle') {
        return state;
      }
      return { stage: stageFor(action.call, 'CALLER'), role: 'CALLER', call: action.call };
    }

    case 'accepted': {
      if (state.stage !== 'incoming' || state.call?.id !== action.call.id) {
        return state;
      }
      return { stage: stageFor(action.call, 'RECEIVER'), role: 'RECEIVER', call: action.call };
    }

    case 'resumed': {
      if (state.stage !== 'idle') {
        return state;
      }
      const role: CallRole = action.call.caller.userId === action.userId ? 'CALLER' : 'RECEIVER';
      return { stage: stageFor(action.call, role), role, call: action.call };
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

    case 'reset':
      return initialCallState;

    default:
      return state;
  }
}
