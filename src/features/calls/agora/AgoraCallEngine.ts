import {
  ChannelProfileType,
  ClientRoleType,
  ConnectionChangedReasonType,
  ConnectionStateType,
  createAgoraRtcEngine,
  ErrorCodeType,
  LocalAudioStreamReason,
  LocalAudioStreamState,
  LocalVideoStreamReason,
  LocalVideoStreamState,
  QualityType,
  RemoteVideoState,
  UserOfflineReasonType,
  type IRtcEngine,
  type IRtcEngineEventHandler,
  type RtcConnection,
} from 'react-native-agora';
import type { NetworkQualityLevel, RtcSession } from '../types/call.types';

export type DeviceFailureReason = 'permission' | 'busy' | 'unavailable' | 'other';

export type EngineConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'failed' | 'disconnected';

export type EngineEvent =
  | { type: 'joined' }
  | { type: 'remoteJoined'; uid: number }
  | { type: 'remoteLeft'; uid: number; dropped: boolean }
  | { type: 'connection'; state: EngineConnectionState; tokenProblem: boolean; rejected: boolean }
  | { type: 'networkQuality'; quality: NetworkQualityLevel }
  | { type: 'tokenWillExpire' }
  | { type: 'tokenExpired' }
  | { type: 'localVideo'; ok: boolean; reason: DeviceFailureReason | null }
  | { type: 'localAudio'; ok: boolean; reason: DeviceFailureReason | null }
  | { type: 'remoteVideo'; uid: number; active: boolean }
  | { type: 'fatal'; code: number };

export interface EngineJoinOptions {
  video: boolean;
  cameraOn: boolean;
  speakerOn: boolean;
}

export class AgoraEngineError extends Error {
  readonly code: number;

  constructor(code: number) {
    super(`Agora engine call failed (${code})`);
    this.name = 'AgoraEngineError';
    this.code = code;
  }
}

type EngineListener = (event: EngineEvent) => void;

function connectionStateOf(state: ConnectionStateType): EngineConnectionState {
  switch (state) {
    case ConnectionStateType.ConnectionStateConnecting:
      return 'connecting';
    case ConnectionStateType.ConnectionStateConnected:
      return 'connected';
    case ConnectionStateType.ConnectionStateReconnecting:
      return 'reconnecting';
    case ConnectionStateType.ConnectionStateFailed:
      return 'failed';
    default:
      return 'disconnected';
  }
}

function networkLevelOf(quality: QualityType): NetworkQualityLevel {
  switch (quality) {
    case QualityType.QualityExcellent:
    case QualityType.QualityGood:
      return 'good';
    case QualityType.QualityPoor:
      return 'poor';
    case QualityType.QualityBad:
    case QualityType.QualityVbad:
    case QualityType.QualityDown:
      return 'bad';
    default:
      return 'unknown';
  }
}

function videoFailureOf(reason: LocalVideoStreamReason): DeviceFailureReason {
  switch (reason) {
    case LocalVideoStreamReason.LocalVideoStreamReasonDeviceNoPermission:
      return 'permission';
    case LocalVideoStreamReason.LocalVideoStreamReasonDeviceBusy:
    case LocalVideoStreamReason.LocalVideoStreamReasonCaptureMultipleForegroundApps:
      return 'busy';
    case LocalVideoStreamReason.LocalVideoStreamReasonDeviceNotFound:
    case LocalVideoStreamReason.LocalVideoStreamReasonDeviceDisconnected:
    case LocalVideoStreamReason.LocalVideoStreamReasonDeviceInvalidId:
      return 'unavailable';
    default:
      return 'other';
  }
}

function audioFailureOf(reason: LocalAudioStreamReason): DeviceFailureReason {
  switch (reason) {
    case LocalAudioStreamReason.LocalAudioStreamReasonDeviceNoPermission:
      return 'permission';
    case LocalAudioStreamReason.LocalAudioStreamReasonDeviceBusy:
      return 'busy';
    case LocalAudioStreamReason.LocalAudioStreamReasonNoRecordingDevice:
    case LocalAudioStreamReason.LocalAudioStreamReasonRecordInvalidId:
      return 'unavailable';
    default:
      return 'other';
  }
}

class AgoraCallEngine {
  private engine: IRtcEngine | null = null;
  private activeChannel: string | null = null;
  private listeners = new Set<EngineListener>();

  private readonly handler: IRtcEngineEventHandler = {
    onJoinChannelSuccess: (connection) => {
      if (this.isCurrent(connection)) {
        this.emit({ type: 'joined' });
      }
    },
    onRejoinChannelSuccess: (connection) => {
      if (this.isCurrent(connection)) {
        this.emit({ type: 'joined' });
      }
    },
    onUserJoined: (connection, remoteUid) => {
      if (this.isCurrent(connection)) {
        this.emit({ type: 'remoteJoined', uid: remoteUid });
      }
    },
    onUserOffline: (connection, remoteUid, reason) => {
      if (this.isCurrent(connection)) {
        this.emit({ type: 'remoteLeft', uid: remoteUid, dropped: reason === UserOfflineReasonType.UserOfflineDropped });
      }
    },
    onConnectionStateChanged: (connection, state, reason) => {
      if (!this.isCurrent(connection)) {
        return;
      }
      this.emit({
        type: 'connection',
        state: connectionStateOf(state),
        tokenProblem:
          reason === ConnectionChangedReasonType.ConnectionChangedInvalidToken ||
          reason === ConnectionChangedReasonType.ConnectionChangedTokenExpired,
        rejected:
          reason === ConnectionChangedReasonType.ConnectionChangedBannedByServer ||
          reason === ConnectionChangedReasonType.ConnectionChangedRejectedByServer ||
          reason === ConnectionChangedReasonType.ConnectionChangedJoinFailed ||
          reason === ConnectionChangedReasonType.ConnectionChangedInvalidAppId ||
          reason === ConnectionChangedReasonType.ConnectionChangedInvalidChannelName,
      });
    },
    onNetworkQuality: (connection, remoteUid, txQuality, rxQuality) => {
      if (!this.isCurrent(connection) || remoteUid !== 0) {
        return;
      }
      const tx = networkLevelOf(txQuality);
      const rx = networkLevelOf(rxQuality);
      const order: NetworkQualityLevel[] = ['unknown', 'good', 'poor', 'bad'];
      this.emit({ type: 'networkQuality', quality: order[Math.max(order.indexOf(tx), order.indexOf(rx))] });
    },
    onTokenPrivilegeWillExpire: (connection) => {
      if (this.isCurrent(connection)) {
        this.emit({ type: 'tokenWillExpire' });
      }
    },
    onRequestToken: (connection) => {
      if (this.isCurrent(connection)) {
        this.emit({ type: 'tokenExpired' });
      }
    },
    onLocalVideoStateChanged: (_source, state, reason) => {
      if (state === LocalVideoStreamState.LocalVideoStreamStateFailed) {
        this.emit({ type: 'localVideo', ok: false, reason: videoFailureOf(reason) });
      } else if (state === LocalVideoStreamState.LocalVideoStreamStateCapturing || state === LocalVideoStreamState.LocalVideoStreamStateEncoding) {
        this.emit({ type: 'localVideo', ok: true, reason: null });
      }
    },
    onLocalAudioStateChanged: (connection, state, reason) => {
      if (!this.isCurrent(connection)) {
        return;
      }
      if (state === LocalAudioStreamState.LocalAudioStreamStateFailed) {
        this.emit({ type: 'localAudio', ok: false, reason: audioFailureOf(reason) });
      } else if (state === LocalAudioStreamState.LocalAudioStreamStateRecording || state === LocalAudioStreamState.LocalAudioStreamStateEncoding) {
        this.emit({ type: 'localAudio', ok: true, reason: null });
      }
    },
    onRemoteVideoStateChanged: (connection, remoteUid, state) => {
      if (!this.isCurrent(connection)) {
        return;
      }
      this.emit({ type: 'remoteVideo', uid: remoteUid, active: state === RemoteVideoState.RemoteVideoStateDecoding });
    },
    onError: (err) => {
      if (
        err === ErrorCodeType.ErrInvalidToken ||
        err === ErrorCodeType.ErrTokenExpired ||
        err === ErrorCodeType.ErrJoinChannelRejected ||
        err === ErrorCodeType.ErrInvalidAppId ||
        err === ErrorCodeType.ErrInvalidChannelName ||
        err === ErrorCodeType.ErrNoPermission
      ) {
        this.emit({ type: 'fatal', code: err });
      }
    },
  };

  get isActive(): boolean {
    return this.engine !== null;
  }

  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  join(session: RtcSession, options: EngineJoinOptions): void {
    this.teardown();

    const engine = createAgoraRtcEngine();
    this.engine = engine;
    this.activeChannel = session.channelName;

    try {
      this.check(
        engine.initialize({
          appId: session.appId,
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
        }),
      );
      engine.registerEventHandler(this.handler);
      this.check(engine.enableAudio());
      engine.setDefaultAudioRouteToSpeakerphone(options.speakerOn);

      if (options.video) {
        this.check(engine.enableVideo());
        if (options.cameraOn) {
          this.check(engine.startPreview());
        } else {
          engine.enableLocalVideo(false);
        }
      } else {
        engine.disableVideo();
      }

      this.check(
        engine.joinChannel(session.token, session.channelName, session.uid, {
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishMicrophoneTrack: true,
          publishCameraTrack: options.video && options.cameraOn,
          autoSubscribeAudio: true,
          autoSubscribeVideo: options.video,
        }),
      );
    } catch (error) {
      this.teardown();
      throw error;
    }
  }

  leave(): void {
    this.teardown();
  }

  renewToken(token: string): void {
    if (this.engine) {
      this.check(this.engine.renewToken(token));
    }
  }

  setMicrophoneMuted(muted: boolean): void {
    this.engine?.muteLocalAudioStream(muted);
  }

  setCameraEnabled(enabled: boolean): void {
    if (!this.engine) {
      return;
    }
    this.engine.enableLocalVideo(enabled);
    this.engine.muteLocalVideoStream(!enabled);
    if (enabled) {
      this.engine.startPreview();
    }
  }

  switchCamera(): void {
    this.engine?.switchCamera();
  }

  setSpeakerOn(speakerOn: boolean): void {
    this.engine?.setEnableSpeakerphone(speakerOn);
  }

  private isCurrent(connection: RtcConnection): boolean {
    return this.engine !== null && (!connection.channelId || connection.channelId === this.activeChannel);
  }

  private emit(event: EngineEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  private check(code: number): void {
    if (code < 0) {
      throw new AgoraEngineError(code);
    }
  }

  private teardown(): void {
    const engine = this.engine;
    if (!engine) {
      return;
    }

    this.engine = null;
    this.activeChannel = null;

    try {
      engine.unregisterEventHandler(this.handler);
    } catch {}
    try {
      engine.stopPreview();
    } catch {}
    try {
      engine.leaveChannel();
    } catch {}
    try {
      engine.release();
    } catch {}
  }
}

export const agoraCallEngine = new AgoraCallEngine();
