export type CallType = 'VOICE' | 'VIDEO';

export type CallStatus =
  | 'RINGING'
  | 'ACCEPTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'ENDED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'MISSED'
  | 'FAILED';

export type CallEndReason =
  | 'HANGUP'
  | 'REMOTE_LEFT'
  | 'REJECTED'
  | 'CANCELLED'
  | 'NO_ANSWER'
  | 'NETWORK_FAILURE'
  | 'MEDIA_FAILURE'
  | 'PERMISSION_DENIED'
  | 'SIGNALING_FAILURE'
  | 'JOIN_TIMEOUT'
  | 'MAX_DURATION';

export type CallClientEndReason =
  | 'HANGUP'
  | 'REMOTE_LEFT'
  | 'NETWORK_FAILURE'
  | 'MEDIA_FAILURE'
  | 'PERMISSION_DENIED'
  | 'SIGNALING_FAILURE';

export type CallParticipantRole = 'USER' | 'DOCTOR' | 'LABORATORIAN';

export interface CallParticipant {
  userId: string;
  role: CallParticipantRole;
  name: string;
  subtitle: string | null;
  photoUrl: string | null;
}

export interface Call {
  id: string;
  appointmentId: string;
  meetingId: string;
  callType: CallType;
  status: CallStatus;
  caller: CallParticipant;
  receiver: CallParticipant;
  startedAt: string;
  ringingAt: string;
  ringExpiresAt: string;
  acceptedAt: string | null;
  connectedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  endReason: CallEndReason | null;
  createdAt: string;
  updatedAt: string;
}

export interface IceServer {
  urls: string[];
  username?: string | null;
  credential?: string | null;
}

export interface IceConfig {
  callId: string;
  iceServers: IceServer[];
  expiresAtUtc: string;
  relayAvailable: boolean;
}

export interface CallContextRef {
  appointmentId: string;
}

export interface StartCallInput {
  callType: CallType;
  context: CallContextRef;
}

export interface CallHistoryQuery {
  status?: CallStatus;
  callType?: CallType;
  page?: number;
  pageSize?: number;
}

export type CallRole = 'CALLER' | 'RECEIVER';

export type CallStage = 'idle' | 'incoming' | 'outgoing' | 'active' | 'ended';

export type NetworkQualityLevel = 'unknown' | 'good' | 'poor';

export type MediaConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

export type CallIssue =
  | 'permission_denied'
  | 'microphone_unavailable'
  | 'camera_unavailable'
  | 'connection_failed'
  | 'signaling_failed';
