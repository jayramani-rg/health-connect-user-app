import { MediaStream, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import type { CallIssue, CallType, IceServer, MediaConnectionState, NetworkQualityLevel } from '../types/call.types';
import { mediaConstraintsFor, offerOptionsFor, usesCamera } from './mediaPolicy';

export interface LocalCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

export type PeerEvent =
  | { type: 'connection'; state: MediaConnectionState; iceFailed: boolean }
  | { type: 'localCandidate'; candidate: LocalCandidate }
  | { type: 'remoteStream'; streamURL: string | null; hasVideo: boolean }
  | { type: 'quality'; quality: NetworkQualityLevel };

export interface WebRTCSessionOptions {
  callType: CallType;
  iceServers: IceServer[];
  cameraAllowed: boolean;
  onEvent: (event: PeerEvent) => void;
}

interface PeerEmitter {
  addEventListener(type: string, listener: (event: any) => void): void;
}

export class MediaAccessError extends Error {
  readonly issue: CallIssue;

  constructor(issue: CallIssue) {
    super(issue);
    this.issue = issue;
  }
}

const STATS_INTERVAL_MS = 5000;
const POOR_RTT_SECONDS = 0.5;
const POOR_LOSS_RATIO = 0.08;

function classifyMediaError(error: unknown): CallIssue {
  const name = String((error as { name?: string } | null)?.name ?? '');
  const message = String((error as { message?: string } | null)?.message ?? '').toLowerCase();
  if (name === 'NotAllowedError' || name === 'SecurityError' || message.includes('permission')) {
    return 'permission_denied';
  }
  return 'microphone_unavailable';
}

export class WebRTCSession {
  private readonly callType: CallType;
  private readonly options: WebRTCSessionOptions;
  private peer: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private pendingCandidates: RTCIceCandidate[] = [];
  private remoteDescriptionSet = false;
  private statsTimer: ReturnType<typeof setInterval> | null = null;
  private lastInbound: { received: number; lost: number } | null = null;
  private closed = false;

  constructor(options: WebRTCSessionOptions) {
    this.options = options;
    this.callType = options.callType;
  }

  get hasLocalVideo(): boolean {
    return (this.localStream?.getVideoTracks().length ?? 0) > 0;
  }

  get localStreamURL(): string | null {
    return this.hasLocalVideo && this.localStream ? this.localStream.toURL() : null;
  }

  async openMedia(): Promise<CallIssue | null> {
    const constraints = mediaConstraintsFor(this.callType, this.options.cameraAllowed);
    let nonFatalIssue: CallIssue | null = null;

    try {
      this.localStream = await mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if (constraints.video === false) {
        throw new MediaAccessError(classifyMediaError(error));
      }

      try {
        this.localStream = await mediaDevices.getUserMedia({ audio: constraints.audio, video: false });
        nonFatalIssue = 'camera_unavailable';
      } catch (inner) {
        throw new MediaAccessError(classifyMediaError(inner));
      }
    }

    if (this.localStream.getAudioTracks().length === 0) {
      throw new MediaAccessError('microphone_unavailable');
    }

    return nonFatalIssue;
  }

  private ensurePeer(): RTCPeerConnection {
    if (this.peer) {
      return this.peer;
    }

    const peer = new RTCPeerConnection({
      iceServers: this.options.iceServers.map((server) => ({
        urls: server.urls,
        username: server.username ?? undefined,
        credential: server.credential ?? undefined,
      })),
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    const emitter = peer as unknown as PeerEmitter;

    const stream = this.localStream;
    if (stream) {
      stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));
      if (usesCamera(this.callType, this.options.cameraAllowed)) {
        stream.getVideoTracks().forEach((track) => peer.addTrack(track, stream));
      }
    }

    emitter.addEventListener('icecandidate', (event) => {
      const candidate = event.candidate;
      if (candidate && candidate.candidate) {
        this.emit({
          type: 'localCandidate',
          candidate: {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid ?? null,
            sdpMLineIndex: candidate.sdpMLineIndex ?? null,
          },
        });
      }
    });

    emitter.addEventListener('track', (event) => {
      const remote = event.streams[0];
      if (!remote) {
        return;
      }
      this.remoteStream = remote;
      this.emit({
        type: 'remoteStream',
        streamURL: remote.toURL(),
        hasVideo: this.callType === 'VIDEO' && remote.getVideoTracks().length > 0,
      });
    });

    emitter.addEventListener('connectionstatechange', () => this.publishConnection());
    emitter.addEventListener('iceconnectionstatechange', () => this.publishConnection());

    this.peer = peer;
    return peer;
  }

  private publishConnection(): void {
    const peer = this.peer;
    if (!peer || this.closed) {
      return;
    }

    const connection = peer.connectionState;
    const ice = peer.iceConnectionState;
    const iceFailed = ice === 'failed';

    let state: MediaConnectionState;
    if (connection === 'failed' || iceFailed) {
      state = 'failed';
    } else if (connection === 'disconnected' || ice === 'disconnected') {
      state = 'reconnecting';
    } else if (connection === 'connected' && (ice === 'connected' || ice === 'completed')) {
      state = 'connected';
    } else if (connection === 'closed') {
      state = 'disconnected';
    } else {
      state = 'connecting';
    }

    if (state === 'connected') {
      this.startStats();
    }

    this.emit({ type: 'connection', state, iceFailed });
  }

  async createOffer(iceRestart = false): Promise<string> {
    const peer = this.ensurePeer();
    if (iceRestart) {
      peer.restartIce();
    }
    const offer = await peer.createOffer({ ...offerOptionsFor(this.callType), iceRestart });
    await peer.setLocalDescription(offer);
    return String(peer.localDescription?.sdp ?? offer.sdp);
  }

  async acceptOffer(sdp: string): Promise<string> {
    const peer = this.ensurePeer();
    await peer.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
    this.remoteDescriptionSet = true;
    await this.flushCandidates();
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return String(peer.localDescription?.sdp ?? answer.sdp);
  }

  async acceptAnswer(sdp: string): Promise<void> {
    const peer = this.ensurePeer();
    if (peer.signalingState !== 'have-local-offer') {
      return;
    }
    await peer.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
    this.remoteDescriptionSet = true;
    await this.flushCandidates();
  }

  hasRemoteDescription(): boolean {
    return this.remoteDescriptionSet;
  }

  async addRemoteCandidate(candidate: LocalCandidate): Promise<void> {
    const ice = new RTCIceCandidate({
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
    });

    if (!this.peer || !this.remoteDescriptionSet) {
      this.pendingCandidates.push(ice);
      return;
    }

    try {
      await this.peer.addIceCandidate(ice);
    } catch {}
  }

  private async flushCandidates(): Promise<void> {
    const peer = this.peer;
    if (!peer) {
      return;
    }
    const queued = this.pendingCandidates;
    this.pendingCandidates = [];
    for (const candidate of queued) {
      try {
        await peer.addIceCandidate(candidate);
      } catch {}
    }
  }

  setMuted(muted: boolean): void {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  setCameraEnabled(enabled: boolean): void {
    if (this.callType !== 'VIDEO') {
      return;
    }
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  switchCamera(): void {
    if (this.callType !== 'VIDEO') {
      return;
    }
    this.localStream?.getVideoTracks().forEach((track) => track._switchCamera());
  }

  private startStats(): void {
    if (this.statsTimer || this.closed) {
      return;
    }
    this.statsTimer = setInterval(() => {
      this.sampleQuality();
    }, STATS_INTERVAL_MS);
  }

  private async sampleQuality(): Promise<void> {
    const peer = this.peer;
    if (!peer || this.closed) {
      return;
    }

    try {
      const report = await peer.getStats();
      let rtt: number | null = null;
      let received = 0;
      let lost = 0;

      report.forEach((stat: Record<string, unknown>) => {
        if (stat.type === 'candidate-pair' && stat.nominated && stat.state === 'succeeded' && typeof stat.currentRoundTripTime === 'number') {
          rtt = stat.currentRoundTripTime;
        }
        if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
          received += Number(stat.packetsReceived ?? 0);
          lost += Number(stat.packetsLost ?? 0);
        }
      });

      let lossRatio = 0;
      if (this.lastInbound) {
        const deltaReceived = received - this.lastInbound.received;
        const deltaLost = lost - this.lastInbound.lost;
        const total = deltaReceived + deltaLost;
        lossRatio = total > 0 ? Math.max(0, deltaLost) / total : 0;
      }
      this.lastInbound = { received, lost };

      const poor = (rtt !== null && rtt > POOR_RTT_SECONDS) || lossRatio > POOR_LOSS_RATIO;
      this.emit({ type: 'quality', quality: poor ? 'poor' : 'good' });
    } catch {}
  }

  private emit(event: PeerEvent): void {
    if (!this.closed) {
      this.options.onEvent(event);
    }
  }

  close(): void {
    if (this.closed) {
      return;
    }
    this.closed = true;

    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }

    try {
      this.peer?.close();
    } catch {}
    this.peer = null;

    try {
      this.localStream?.getTracks().forEach((track) => track.stop());
      this.localStream?.release();
    } catch {}
    this.localStream = null;

    try {
      this.remoteStream?.release();
    } catch {}
    this.remoteStream = null;

    this.pendingCandidates = [];
  }
}
