import { createContext, useContext } from 'react';
import type { AgoraCallControls, AgoraCallMedia } from '../hooks/useAgoraCall';
import type { CallState } from '../state/callReducer';
import type { CallClientEndReason, StartCallInput } from '../types/call.types';

export type StartCallOutcome = { ok: true } | { ok: false; message: string | null };

export interface CallContextValue {
  state: CallState;
  userId: string | null;
  media: AgoraCallMedia;
  controls: AgoraCallControls;
  startCall: (input: StartCallInput) => Promise<StartCallOutcome>;
  acceptCall: () => Promise<void>;
  declineCall: () => Promise<void>;
  endCall: (reason?: CallClientEndReason) => Promise<void>;
  isBusy: boolean;
}

export const CallContext = createContext<CallContextValue | null>(null);

export function useCall(): CallContextValue {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used inside CallProvider.');
  }
  return context;
}
