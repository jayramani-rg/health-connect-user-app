import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { callService } from '../../../services/callService';
import { agoraCallEngine, type EngineEvent } from '../agora/AgoraCallEngine';
import type { Call, CallClientEndReason, CallIssue, MediaConnectionState, NetworkQualityLevel, RtcSession } from '../types/call.types';

const RECONNECT_GRACE_MS = 30000;
const REMOTE_DROP_GRACE_MS = 30000;
const JOIN_REPORT_ATTEMPTS = 3;
const TOKEN_RENEW_ATTEMPTS = 3;

export interface AgoraCallMedia {
  connection: MediaConnectionState;
  remoteUid: number | null;
  remoteVideoActive: boolean;
  localVideoReady: boolean;
  muted: boolean;
  cameraOn: boolean;
  speakerOn: boolean;
  networkQuality: NetworkQualityLevel;
  issue: CallIssue | null;
  mediaConnectedAt: number | null;
}

const idleMedia: AgoraCallMedia = {
  connection: 'idle',
  remoteUid: null,
  remoteVideoActive: false,
  localVideoReady: false,
  muted: false,
  cameraOn: false,
  speakerOn: false,
  networkQuality: 'unknown',
  issue: null,
  mediaConnectedAt: null,
};

export interface UseAgoraCallParams {
  call: Call | null;
  rtc: RtcSession | null;
  active: boolean;
  cameraAllowed: boolean;
  onTokenRefreshed: (rtc: RtcSession) => void;
  onRequestEnd: (reason: CallClientEndReason) => void;
}

export interface AgoraCallControls {
  toggleMute: () => void;
  toggleCamera: () => void;
  switchCamera: () => void;
  toggleSpeaker: () => void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPermanentFailure(error: unknown): boolean {
  const statusCode = (error as { statusCode?: number } | null)?.statusCode ?? 0;
  return statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429;
}

export function useAgoraCall(params: UseAgoraCallParams): { media: AgoraCallMedia; controls: AgoraCallControls } {
  const { call, rtc, active, cameraAllowed } = params;
  const [media, setMedia] = useState<AgoraCallMedia>(idleMedia);

  const paramsRef = useRef(params);
  paramsRef.current = params;
  const mediaRef = useRef(media);
  mediaRef.current = media;

  const sessionCallIdRef = useRef<string | null>(null);
  const localJoinedRef = useRef(false);
  const remoteUidRef = useRef<number | null>(null);
  const cameraSuspendedRef = useRef(false);
  const renewingRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteDropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const patch = useCallback((partial: Partial<AgoraCallMedia>) => {
    setMedia((current) => ({ ...current, ...partial }));
  }, []);

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (remoteDropTimerRef.current) {
      clearTimeout(remoteDropTimerRef.current);
      remoteDropTimerRef.current = null;
    }
  }, []);

  const reportJoined = useCallback(async (callId: string) => {
    for (let attempt = 0; attempt < JOIN_REPORT_ATTEMPTS; attempt += 1) {
      try {
        await callService.markJoined(callId);
        return;
      } catch (error) {
        if (isPermanentFailure(error) || sessionCallIdRef.current !== callId) {
          return;
        }
        await wait(1000 * (attempt + 1));
      }
    }
  }, []);

  const renewToken = useCallback(async () => {
    const callId = sessionCallIdRef.current;
    if (!callId || renewingRef.current) {
      return;
    }
    renewingRef.current = true;
    try {
      for (let attempt = 0; attempt < TOKEN_RENEW_ATTEMPTS; attempt += 1) {
        try {
          const response = await callService.issueToken(callId);
          if (sessionCallIdRef.current !== callId) {
            return;
          }
          agoraCallEngine.renewToken(response.data.token);
          paramsRef.current.onTokenRefreshed(response.data);
          return;
        } catch (error) {
          if (isPermanentFailure(error) || attempt === TOKEN_RENEW_ATTEMPTS - 1) {
            break;
          }
          await wait(1500 * (attempt + 1));
        }
      }
      if (sessionCallIdRef.current === callId) {
        patch({ issue: 'token_failed' });
        paramsRef.current.onRequestEnd('TOKEN_FAILURE');
      }
    } finally {
      renewingRef.current = false;
    }
  }, [patch]);

  const handleEvent = useCallback(
    (event: EngineEvent) => {
      const callId = sessionCallIdRef.current;
      if (!callId) {
        return;
      }

      switch (event.type) {
        case 'joined': {
          localJoinedRef.current = true;
          setMedia((current) => ({
            ...current,
            connection: 'connected',
            mediaConnectedAt: current.mediaConnectedAt ?? (remoteUidRef.current !== null ? Date.now() : null),
          }));
          reportJoined(callId);
          break;
        }

        case 'remoteJoined': {
          remoteUidRef.current = event.uid;
          if (remoteDropTimerRef.current) {
            clearTimeout(remoteDropTimerRef.current);
            remoteDropTimerRef.current = null;
          }
          setMedia((current) => ({
            ...current,
            remoteUid: event.uid,
            mediaConnectedAt: current.mediaConnectedAt ?? (localJoinedRef.current ? Date.now() : null),
          }));
          break;
        }

        case 'remoteLeft': {
          if (event.uid !== remoteUidRef.current) {
            break;
          }
          remoteUidRef.current = null;
          patch({ remoteUid: null, remoteVideoActive: false });
          if (event.dropped) {
            remoteDropTimerRef.current = setTimeout(() => {
              paramsRef.current.onRequestEnd('NETWORK_FAILURE');
            }, REMOTE_DROP_GRACE_MS);
          } else {
            paramsRef.current.onRequestEnd('REMOTE_LEFT');
          }
          break;
        }

        case 'connection': {
          if (event.rejected) {
            patch({ connection: 'failed', issue: 'connection_failed' });
            paramsRef.current.onRequestEnd('MEDIA_FAILURE');
            break;
          }
          if (event.tokenProblem) {
            renewToken();
          }
          if (event.state === 'reconnecting') {
            patch({ connection: 'reconnecting' });
            if (!reconnectTimerRef.current) {
              reconnectTimerRef.current = setTimeout(() => {
                reconnectTimerRef.current = null;
                patch({ issue: 'connection_failed' });
                paramsRef.current.onRequestEnd('NETWORK_FAILURE');
              }, RECONNECT_GRACE_MS);
            }
          } else if (event.state === 'connected') {
            if (reconnectTimerRef.current) {
              clearTimeout(reconnectTimerRef.current);
              reconnectTimerRef.current = null;
            }
            patch({ connection: 'connected' });
          } else if (event.state === 'failed') {
            patch({ connection: 'failed', issue: 'connection_failed' });
            paramsRef.current.onRequestEnd('NETWORK_FAILURE');
          }
          break;
        }

        case 'networkQuality':
          patch({ networkQuality: event.quality });
          break;

        case 'tokenWillExpire':
        case 'tokenExpired':
          renewToken();
          break;

        case 'localVideo': {
          if (event.ok) {
            patch({ localVideoReady: true });
          } else {
            patch({
              localVideoReady: false,
              cameraOn: false,
              issue: event.reason === 'permission' ? 'permission_denied' : 'camera_unavailable',
            });
          }
          break;
        }

        case 'localAudio': {
          if (!event.ok) {
            patch({ issue: event.reason === 'permission' ? 'permission_denied' : 'microphone_unavailable' });
          }
          break;
        }

        case 'remoteVideo': {
          if (event.uid === remoteUidRef.current) {
            patch({ remoteVideoActive: event.active });
          }
          break;
        }

        case 'fatal': {
          renewToken();
          break;
        }
      }
    },
    [patch, renewToken, reportJoined],
  );

  useEffect(() => agoraCallEngine.subscribe(handleEvent), [handleEvent]);

  const callId = call?.id ?? null;
  const callType = call?.callType ?? null;
  const rtcCallId = rtc?.callId ?? null;

  useEffect(() => {
    if (!active || !callId || !callType || !rtcCallId || rtcCallId !== callId) {
      return undefined;
    }

    const session = paramsRef.current.rtc;
    if (!session) {
      return undefined;
    }

    const video = callType === 'VIDEO';
    const cameraOn = video && cameraAllowed;

    sessionCallIdRef.current = callId;
    localJoinedRef.current = false;
    remoteUidRef.current = null;
    cameraSuspendedRef.current = false;

    setMedia({ ...idleMedia, connection: 'joining', cameraOn, speakerOn: video });

    try {
      agoraCallEngine.join(session, { video, cameraOn, speakerOn: video });
    } catch {
      sessionCallIdRef.current = null;
      setMedia({ ...idleMedia, connection: 'failed', issue: 'connection_failed' });
      paramsRef.current.onRequestEnd('MEDIA_FAILURE');
      return undefined;
    }

    return () => {
      sessionCallIdRef.current = null;
      localJoinedRef.current = false;
      remoteUidRef.current = null;
      clearTimers();
      agoraCallEngine.leave();
      setMedia(idleMedia);
    };
  }, [active, callId, callType, rtcCallId, cameraAllowed, clearTimers]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const current = mediaRef.current;
      if (!sessionCallIdRef.current) {
        return;
      }
      if (nextState !== 'active') {
        if (current.cameraOn) {
          agoraCallEngine.setCameraEnabled(false);
          cameraSuspendedRef.current = true;
        }
      } else if (cameraSuspendedRef.current) {
        cameraSuspendedRef.current = false;
        if (current.cameraOn) {
          agoraCallEngine.setCameraEnabled(true);
        }
      }
    });
    return () => subscription.remove();
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mediaRef.current.muted;
    agoraCallEngine.setMicrophoneMuted(next);
    patch({ muted: next });
  }, [patch]);

  const toggleCamera = useCallback(() => {
    if (callType !== 'VIDEO') {
      return;
    }
    const next = !mediaRef.current.cameraOn;
    agoraCallEngine.setCameraEnabled(next);
    patch({ cameraOn: next, localVideoReady: next ? mediaRef.current.localVideoReady : false, issue: null });
  }, [callType, patch]);

  const switchCamera = useCallback(() => {
    if (mediaRef.current.cameraOn) {
      agoraCallEngine.switchCamera();
    }
  }, []);

  const toggleSpeaker = useCallback(() => {
    const next = !mediaRef.current.speakerOn;
    agoraCallEngine.setSpeakerOn(next);
    patch({ speakerOn: next });
  }, [patch]);

  return { media, controls: { toggleMute, toggleCamera, switchCamera, toggleSpeaker } };
}
