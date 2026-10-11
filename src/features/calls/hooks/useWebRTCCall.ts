import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { callService } from '../../../services/callService';
import { callSocket } from '../../../services/callSocket';
import type {
  Call,
  CallClientEndReason,
  CallIssue,
  CallRole,
  IceServer,
  MediaConnectionState,
  NetworkQualityLevel,
} from '../types/call.types';
import { startsOnSpeaker } from '../webrtc/mediaPolicy';
import { audioRoute } from '../webrtc/audioRoute';
import { MediaAccessError, WebRTCSession, type PeerEvent } from '../webrtc/WebRTCSession';

const RECONNECT_GRACE_MS = 30000;
const REMOTE_DROP_GRACE_MS = 30000;
const ICE_RESTART_DELAY_MS = 4000;
const OFFER_WAIT_MS = 4000;
const CONNECTED_REPORT_ATTEMPTS = 3;
const SETUP_ATTEMPTS = 3;

export interface CallMedia {
  connection: MediaConnectionState;
  remoteStreamURL: string | null;
  localStreamURL: string | null;
  remoteVideoActive: boolean;
  muted: boolean;
  cameraOn: boolean;
  speakerOn: boolean;
  networkQuality: NetworkQualityLevel;
  issue: CallIssue | null;
  mediaConnectedAt: number | null;
}

const idleMedia: CallMedia = {
  connection: 'idle',
  remoteStreamURL: null,
  localStreamURL: null,
  remoteVideoActive: false,
  muted: false,
  cameraOn: false,
  speakerOn: false,
  networkQuality: 'unknown',
  issue: null,
  mediaConnectedAt: null,
};

export interface UseWebRTCCallParams {
  call: Call | null;
  role: CallRole | null;
  active: boolean;
  cameraAllowed: boolean;
  onRequestEnd: (reason: CallClientEndReason) => void;
}

export interface CallControls {
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

export function useWebRTCCall(params: UseWebRTCCallParams): { media: CallMedia; controls: CallControls } {
  const { call, role, active, cameraAllowed } = params;
  const [media, setMedia] = useState<CallMedia>(idleMedia);

  const paramsRef = useRef(params);
  paramsRef.current = params;
  const mediaRef = useRef(media);
  mediaRef.current = media;

  const sessionRef = useRef<WebRTCSession | null>(null);
  const cameraSuspendedRef = useRef(false);

  const patch = useCallback((partial: Partial<CallMedia>) => {
    setMedia((current) => ({ ...current, ...partial }));
  }, []);

  const callId = call?.id ?? null;
  const callType = call?.callType ?? null;

  useEffect(() => {
    if (!active || !callId || !callType || !role) {
      return undefined;
    }

    let disposed = false;
    let session: WebRTCSession | null = null;
    let queue: Promise<void> = Promise.resolve();
    let ready = false;
    let peerJoined = false;
    let offerSdp: string | null = null;
    let lastOfferSdp: string | null = null;
    let connectedReported = false;
    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectGrace: ReturnType<typeof setTimeout> | null = null;
    let remoteDropTimer: ReturnType<typeof setTimeout> | null = null;
    let offerWaitTimer: ReturnType<typeof setTimeout> | null = null;

    const isCaller = role === 'CALLER';
    const isVideo = callType === 'VIDEO';
    const initialSpeaker = startsOnSpeaker(callType);

    const enqueue = (task: () => Promise<void>) => {
      queue = queue.then(task).catch(() => undefined);
    };

    const fail = (reason: CallClientEndReason, issue: CallIssue) => {
      if (disposed) {
        return;
      }
      patch({ connection: 'failed', issue });
      paramsRef.current.onRequestEnd(reason);
    };

    const clearRestartTimer = () => {
      if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
      }
    };

    const clearGrace = () => {
      if (reconnectGrace) {
        clearTimeout(reconnectGrace);
        reconnectGrace = null;
      }
    };

    const sendOffer = async (iceRestart: boolean) => {
      if (!session) {
        return;
      }
      const sdp = await session.createOffer(iceRestart);
      offerSdp = sdp;
      await callSocket.sendOffer(callId, sdp);
    };

    const requestRestart = async () => {
      if (!session || disposed) {
        return;
      }
      try {
        if (isCaller) {
          await sendOffer(true);
        } else {
          await callSocket.requestIceRestart(callId);
        }
      } catch {}
    };

    const reportConnected = async () => {
      if (connectedReported) {
        return;
      }
      connectedReported = true;
      for (let attempt = 0; attempt < CONNECTED_REPORT_ATTEMPTS; attempt += 1) {
        try {
          await callSocket.reportConnected(callId);
          return;
        } catch {
          try {
            await callService.markConnected(callId);
            return;
          } catch (error) {
            if (isPermanentFailure(error) || disposed) {
              return;
            }
            await wait(1000 * (attempt + 1));
          }
        }
      }
    };

    const onPeerEvent = (event: PeerEvent) => {
      if (disposed) {
        return;
      }

      switch (event.type) {
        case 'localCandidate':
          callSocket
            .sendIceCandidate(callId, event.candidate.candidate, event.candidate.sdpMid, event.candidate.sdpMLineIndex)
            .catch(() => undefined);
          break;

        case 'remoteStream':
          patch({ remoteStreamURL: event.streamURL, remoteVideoActive: event.hasVideo });
          break;

        case 'quality':
          patch({ networkQuality: event.quality });
          break;

        case 'connection': {
          if (event.state === 'connected') {
            clearRestartTimer();
            clearGrace();
            setMedia((current) => ({
              ...current,
              connection: 'connected',
              issue: current.issue === 'connection_failed' ? null : current.issue,
              mediaConnectedAt: current.mediaConnectedAt ?? Date.now(),
            }));
            reportConnected();
            break;
          }

          patch({ connection: event.state });

          if (event.state === 'reconnecting' || event.state === 'failed') {
            if (!reconnectGrace) {
              reconnectGrace = setTimeout(() => {
                reconnectGrace = null;
                fail('NETWORK_FAILURE', 'connection_failed');
              }, RECONNECT_GRACE_MS);
            }
            clearRestartTimer();
            restartTimer = setTimeout(
              () => {
                restartTimer = null;
                requestRestart();
              },
              event.state === 'failed' ? 0 : ICE_RESTART_DELAY_MS,
            );
          }
          break;
        }
      }
    };

    const handleOffer = async (sdp: string) => {
      if (!session || isCaller || sdp === lastOfferSdp) {
        return;
      }
      lastOfferSdp = sdp;
      const answer = await session.acceptOffer(sdp);
      await callSocket.sendAnswer(callId, answer);
    };

    const unsubscribers = [
      callSocket.onOffer((signal) => {
        if (signal.callId === callId) {
          enqueue(() => handleOffer(signal.sdp));
        }
      }),
      callSocket.onAnswer((signal) => {
        if (signal.callId === callId) {
          enqueue(async () => {
            await session?.acceptAnswer(signal.sdp);
          });
        }
      }),
      callSocket.onIceCandidate((signal) => {
        if (signal.callId === callId) {
          enqueue(async () => {
            await session?.addRemoteCandidate({
              candidate: signal.candidate,
              sdpMid: signal.sdpMid,
              sdpMLineIndex: signal.sdpMLineIndex,
            });
          });
        }
      }),
      callSocket.onIceRestartRequested((signal) => {
        if (signal.callId === callId && isCaller) {
          enqueue(async () => {
            await sendOffer(true);
          });
        }
      }),
      callSocket.onParticipantJoined((signal) => {
        if (signal.callId !== callId) {
          return;
        }
        peerJoined = true;
        if (remoteDropTimer) {
          clearTimeout(remoteDropTimer);
          remoteDropTimer = null;
        }
        if (isCaller && ready) {
          enqueue(async () => {
            if (offerSdp && !session?.hasRemoteDescription()) {
              await callSocket.sendOffer(callId, offerSdp);
            } else if (!offerSdp) {
              await sendOffer(false);
            }
          });
        }
      }),
      callSocket.onParticipantDisconnected((signal) => {
        if (signal.callId !== callId || remoteDropTimer) {
          return;
        }
        remoteDropTimer = setTimeout(() => {
          remoteDropTimer = null;
          fail('REMOTE_LEFT', 'connection_failed');
        }, REMOTE_DROP_GRACE_MS);
      }),
      callSocket.onReconnected(() => {
        callSocket.joinCall(callId).catch(() => undefined);
        enqueue(async () => {
          await requestRestart();
        });
      }),
    ];

    const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      if (!ready || mediaRef.current.connection !== 'connected') {
        return;
      }
      if (state.isConnected === false) {
        patch({ connection: 'reconnecting' });
        return;
      }
      clearRestartTimer();
      restartTimer = setTimeout(() => {
        restartTimer = null;
        requestRestart();
      }, 500);
    });

    setMedia({ ...idleMedia, connection: 'connecting', speakerOn: initialSpeaker });

    const setup = async () => {
      let cameraIssue: CallIssue | null = null;
      let iceServers: IceServer[] | null = null;

      for (let attempt = 0; attempt < SETUP_ATTEMPTS && !iceServers; attempt += 1) {
        try {
          const response = await callService.iceServers(callId);
          iceServers = response.data.iceServers;
        } catch (error) {
          if (isPermanentFailure(error) || attempt === SETUP_ATTEMPTS - 1) {
            fail('SIGNALING_FAILURE', 'signaling_failed');
            return;
          }
          await wait(1000 * (attempt + 1));
        }
      }

      if (disposed || !iceServers) {
        return;
      }

      session = new WebRTCSession({ callType, iceServers, cameraAllowed, onEvent: onPeerEvent });
      sessionRef.current = session;

      try {
        cameraIssue = await session.openMedia();
      } catch (error) {
        const issue = error instanceof MediaAccessError ? error.issue : 'microphone_unavailable';
        fail(issue === 'permission_denied' ? 'PERMISSION_DENIED' : 'MEDIA_FAILURE', issue);
        return;
      }

      if (disposed) {
        return;
      }

      audioRoute.start(callType, initialSpeaker);
      setMedia((current) => ({
        ...current,
        cameraOn: isVideo && session !== null && session.hasLocalVideo,
        localStreamURL: session?.localStreamURL ?? null,
        issue: cameraIssue,
      }));

      try {
        await callSocket.connect();
        await callSocket.joinCall(callId);
      } catch {
        fail('SIGNALING_FAILURE', 'signaling_failed');
        return;
      }

      ready = true;

      if (isCaller) {
        offerWaitTimer = setTimeout(() => {
          offerWaitTimer = null;
          enqueue(async () => {
            if (!offerSdp) {
              await sendOffer(false);
            }
          });
        }, OFFER_WAIT_MS);

        if (peerJoined) {
          enqueue(async () => {
            if (!offerSdp) {
              await sendOffer(false);
            }
          });
        }
      }
    };

    setup().catch(() => fail('SIGNALING_FAILURE', 'signaling_failed'));

    return () => {
      disposed = true;
      ready = false;
      unsubscribers.forEach((off) => off());
      netInfoUnsubscribe();
      clearRestartTimer();
      clearGrace();
      if (remoteDropTimer) {
        clearTimeout(remoteDropTimer);
      }
      if (offerWaitTimer) {
        clearTimeout(offerWaitTimer);
      }
      callSocket.leaveCall(callId).catch(() => undefined);
      session?.close();
      sessionRef.current = null;
      audioRoute.stop();
      cameraSuspendedRef.current = false;
      setMedia(idleMedia);
    };
  }, [active, callId, callType, role, cameraAllowed, patch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const session = sessionRef.current;
      if (!session || callType !== 'VIDEO') {
        return;
      }
      if (nextState !== 'active') {
        if (mediaRef.current.cameraOn) {
          session.setCameraEnabled(false);
          cameraSuspendedRef.current = true;
        }
      } else if (cameraSuspendedRef.current) {
        cameraSuspendedRef.current = false;
        if (mediaRef.current.cameraOn) {
          session.setCameraEnabled(true);
        }
      }
    });
    return () => subscription.remove();
  }, [callType]);

  const toggleMute = useCallback(() => {
    const next = !mediaRef.current.muted;
    sessionRef.current?.setMuted(next);
    patch({ muted: next });
  }, [patch]);

  const toggleCamera = useCallback(() => {
    const session = sessionRef.current;
    if (callType !== 'VIDEO' || !session || !session.hasLocalVideo) {
      return;
    }
    const next = !mediaRef.current.cameraOn;
    session.setCameraEnabled(next);
    patch({ cameraOn: next });
  }, [callType, patch]);

  const switchCamera = useCallback(() => {
    if (callType === 'VIDEO' && mediaRef.current.cameraOn) {
      sessionRef.current?.switchCamera();
    }
  }, [callType]);

  const toggleSpeaker = useCallback(() => {
    const next = !mediaRef.current.speakerOn;
    audioRoute.setSpeaker(next);
    patch({ speakerOn: next });
  }, [patch]);

  return { media, controls: { toggleMute, toggleCamera, switchCamera, toggleSpeaker } };
}
