export type CallType = 'VOICE' | 'VIDEO';

export type CallStatus = 'RINGING' | 'ACCEPTED' | 'CONNECTED' | 'ENDED' | 'REJECTED' | 'CANCELLED' | 'MISSED' | 'FAILED';

export type CallEndReason =
  | 'HANGUP'
  | 'REMOTE_LEFT'
  | 'REJECTED'
  | 'CANCELLED'
  | 'NO_ANSWER'
  | 'NETWORK_FAILURE'
  | 'MEDIA_FAILURE'
  | 'PERMISSION_DENIED'
  | 'TOKEN_FAILURE'
  | 'JOIN_TIMEOUT'
  | 'MAX_DURATION';

export type CallClientEndReason = 'HANGUP' | 'REMOTE_LEFT' | 'NETWORK_FAILURE' | 'MEDIA_FAILURE' | 'PERMISSION_DENIED' | 'TOKEN_FAILURE';

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
  callType: CallType;
  status: CallStatus;
  conversationId: string | null;
  appointmentId: string | null;
  labBookingId: string | null;
  caller: CallParticipant;
  receiver: CallParticipant;
  startedAt: string;
  ringExpiresAt: string;
  acceptedAt: string | null;
  connectedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  endReason: CallEndReason | null;
  createdAt: string;
  updatedAt: string;
}

export interface RtcSession {
  callId: string;
  callType: CallType;
  appId: string;
  channelName: string;
  token: string;
  uid: number;
  expiresAtUtc: string;
}

export interface CallSession {
  call: Call;
  rtc: RtcSession | null;
}

export type CallContextRef = { conversationId: string } | { appointmentId: string } | { labBookingId: string };

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

export type NetworkQualityLevel = 'unknown' | 'good' | 'poor' | 'bad';

export type MediaConnectionState = 'idle' | 'joining' | 'connected' | 'reconnecting' | 'failed';

export type CallIssue = 'permission_denied' | 'microphone_unavailable' | 'camera_unavailable' | 'connection_failed' | 'token_failed';
