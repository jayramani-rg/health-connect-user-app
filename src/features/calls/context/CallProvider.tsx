import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppState, Vibration } from 'react-native';
import { StackActions } from '@react-navigation/native';

import { callService } from '../../../services/callService';
import { chatSocket } from '../../../services/chatSocket';
import { navigationRef } from '../../../navigation/navigationRef';
import { useAppSelector } from '../../../store';
import { useAgoraCall } from '../hooks/useAgoraCall';
import { ensureCallReadiness } from '../permissions/callPermissions';
import { callReducer, initialCallState, isTerminalStatus } from '../state/callReducer';
import type { Call, CallClientEndReason, CallStatus, RtcSession, StartCallInput } from '../types/call.types';
import { startFailureMessage } from '../utils/callMessages';
import { CallContext, type CallContextValue, type StartCallOutcome } from './CallContextValue';
import { ActiveCallBanner } from '../components/ActiveCallBanner';

const ENDED_LINGER_MS = 1800;
const MISSED_LINGER_MS = 900;
const RING_RECHECK_GRACE_MS = 3000;
const INCOMING_VIBRATION_PATTERN = [0, 700, 1300];

function withStatus(call: Call, status: CallStatus): Call {
  return { ...call, status, endedAt: call.endedAt ?? new Date().toISOString() };
}

function runWhenNavigationReady(action: () => void, attemptsLeft = 20): void {
  if (navigationRef.isReady()) {
    action();
    return;
  }
  if (attemptsLeft > 0) {
    setTimeout(() => runWhenNavigationReady(action, attemptsLeft - 1), 150);
  }
}

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((root) => root.authData.isAuthenticated);
  const userId = useAppSelector((root) => root.authData.user?.id ?? null);

  const [state, dispatch] = useReducer(callReducer, initialCallState);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const operationRef = useRef(false);
  const endRequestedRef = useRef<string | null>(null);

  const endCall = useCallback(async (reason: CallClientEndReason = 'HANGUP') => {
    const current = stateRef.current;
    const call = current.call;
    if (!call || current.stage === 'idle' || current.stage === 'ended') {
      return;
    }
    if (endRequestedRef.current === call.id) {
      return;
    }
    endRequestedRef.current = call.id;

    const isRinging = call.status === 'RINGING';
    const isCaller = current.role === 'CALLER';

    dispatch({ type: 'callUpdated', call: withStatus(call, isRinging ? (isCaller ? 'CANCELLED' : 'REJECTED') : 'ENDED') });

    try {
      const response = isRinging
        ? isCaller
          ? await callService.cancel(call.id)
          : await callService.reject(call.id)
        : await callService.end(call.id, reason);
      dispatch({ type: 'callUpdated', call: response.data });
    } catch {}
  }, []);

  const { media, controls } = useAgoraCall({
    call: state.call,
    rtc: state.rtc,
    active: state.stage === 'outgoing' || state.stage === 'active',
    cameraAllowed,
    onTokenRefreshed: (rtc: RtcSession) => dispatch({ type: 'tokenRefreshed', rtc }),
    onRequestEnd: endCall,
  });

  const syncActive = useCallback(async () => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) {
      return;
    }
    try {
      const response = await callService.getActive();
      const session = response.data;
      const current = stateRef.current;

      if (session) {
        if (current.stage === 'idle') {
          setCameraAllowed(session.call.callType === 'VIDEO');
          dispatch({ type: 'resumed', session, userId: currentUserId });
        } else if (current.call?.id === session.call.id) {
          dispatch({ type: 'callUpdated', call: session.call });
        }
        return;
      }

      if (current.call && current.stage !== 'idle' && current.stage !== 'ended' && !isTerminalStatus(current.call.status)) {
        const detail = await callService.get(current.call.id);
        dispatch({ type: 'callUpdated', call: detail.data });
      }
    } catch {}
  }, []);

  const startCall = useCallback(async (input: StartCallInput): Promise<StartCallOutcome> => {
    if (stateRef.current.stage !== 'idle') {
      return { ok: false, message: 'You are already on a call.' };
    }
    if (operationRef.current) {
      return { ok: false, message: null };
    }
    operationRef.current = true;
    setIsBusy(true);
    try {
      const readiness = await ensureCallReadiness(input.callType);
      if (!readiness.canCall) {
        return { ok: false, message: null };
      }
      setCameraAllowed(readiness.cameraAllowed);
      const response = await callService.start(input.callType, input.context);
      endRequestedRef.current = null;
      dispatch({ type: 'outgoingStarted', session: response.data });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: startFailureMessage(error) };
    } finally {
      operationRef.current = false;
      setIsBusy(false);
    }
  }, []);

  const acceptCall = useCallback(async () => {
    const call = stateRef.current.call;
    if (!call || stateRef.current.stage !== 'incoming' || operationRef.current) {
      return;
    }
    operationRef.current = true;
    setIsBusy(true);
    try {
      const readiness = await ensureCallReadiness(call.callType);
      if (!readiness.canCall) {
        return;
      }
      setCameraAllowed(readiness.cameraAllowed);
      endRequestedRef.current = null;
      const response = await callService.accept(call.id);
      dispatch({ type: 'accepted', session: response.data });
    } catch {
      try {
        const detail = await callService.get(call.id);
        dispatch({ type: 'callUpdated', call: detail.data });
      } catch {
        dispatch({ type: 'callUpdated', call: withStatus(call, 'MISSED') });
      }
    } finally {
      operationRef.current = false;
      setIsBusy(false);
    }
  }, []);

  const declineCall = useCallback(async () => {
    const call = stateRef.current.call;
    if (!call || stateRef.current.stage !== 'incoming') {
      return;
    }
    dispatch({ type: 'callUpdated', call: withStatus(call, 'REJECTED') });
    try {
      await callService.reject(call.id);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const offIncoming = chatSocket.onCallIncoming((call) => {
      if (call.receiver.userId === userIdRef.current) {
        dispatch({ type: 'incoming', call });
      }
    });
    const offUpdated = chatSocket.onCallUpdated((call) => dispatch({ type: 'callUpdated', call }));
    const offReconnected = chatSocket.onReconnected(() => {
      syncActive();
    });

    syncActive();

    const appStateSubscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        syncActive();
      }
    });

    return () => {
      offIncoming();
      offUpdated();
      offReconnected();
      appStateSubscription.remove();
    };
  }, [isAuthenticated, syncActive]);

  useEffect(() => {
    if (!isAuthenticated && stateRef.current.stage !== 'idle') {
      dispatch({ type: 'reset' });
    }
  }, [isAuthenticated]);

  const stage = state.stage;
  const callId = state.call?.id ?? null;

  useEffect(() => {
    if (stage === 'incoming') {
      runWhenNavigationReady(() => {
        if (navigationRef.getCurrentRoute()?.name !== 'IncomingCall') {
          navigationRef.navigate('IncomingCall');
        }
      });
    } else if (stage === 'outgoing' || stage === 'active') {
      runWhenNavigationReady(() => {
        const route = navigationRef.getCurrentRoute()?.name;
        if (route === 'IncomingCall') {
          navigationRef.dispatch(StackActions.replace('Calling'));
        } else if (route !== 'Calling') {
          navigationRef.navigate('Calling');
        }
      });
    }
  }, [stage, callId]);

  useEffect(() => {
    if (stage !== 'ended') {
      return undefined;
    }
    const wasConnected = !!stateRef.current.call?.connectedAt || stateRef.current.call?.status === 'ENDED';
    const timer = setTimeout(
      () => {
        dispatch({ type: 'reset' });
        runWhenNavigationReady(() => {
          const route = navigationRef.getCurrentRoute()?.name;
          if (route === 'Calling' || route === 'IncomingCall') {
            navigationRef.dispatch(StackActions.pop());
          }
        });
        syncActive();
      },
      wasConnected ? ENDED_LINGER_MS : MISSED_LINGER_MS,
    );
    return () => clearTimeout(timer);
  }, [stage, callId, syncActive]);

  useEffect(() => {
    if (stage !== 'incoming' && stage !== 'outgoing') {
      return undefined;
    }
    const expiresAt = state.call ? new Date(state.call.ringExpiresAt).getTime() : 0;
    const delay = Math.max(0, expiresAt - Date.now()) + RING_RECHECK_GRACE_MS;
    const timer = setTimeout(() => {
      syncActive();
    }, delay);
    return () => clearTimeout(timer);
  }, [stage, callId, state.call, syncActive]);

  useEffect(() => {
    if (stage !== 'incoming') {
      return undefined;
    }
    Vibration.vibrate(INCOMING_VIBRATION_PATTERN, true);
    return () => Vibration.cancel();
  }, [stage]);

  const value = useMemo<CallContextValue>(
    () => ({ state, userId, media, controls, startCall, acceptCall, declineCall, endCall, isBusy }),
    [state, userId, media, controls, startCall, acceptCall, declineCall, endCall, isBusy],
  );

  return (
    <CallContext.Provider value={value}>
      {children}
      <ActiveCallBanner />
    </CallContext.Provider>
  );
};
