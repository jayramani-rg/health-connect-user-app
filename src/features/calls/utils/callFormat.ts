import type { Call, CallParticipant, CallStatus, CallType } from '../types/call.types';

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function callTypeLabel(callType: CallType): string {
  return callType === 'VIDEO' ? 'Video call' : 'Voice call';
}

export function otherParticipant(call: Call, userId: string): CallParticipant {
  return call.caller.userId === userId ? call.receiver : call.caller;
}

export function isOutgoing(call: Call, userId: string): boolean {
  return call.caller.userId === userId;
}

export interface CallStatusPresentation {
  label: string;
  tone: 'success' | 'neutral' | 'warning' | 'error';
}

export function describeHistoryStatus(call: Call, userId: string): CallStatusPresentation {
  const outgoing = isOutgoing(call, userId);

  const byStatus: Record<CallStatus, CallStatusPresentation> = {
    RINGING: { label: 'Ringing', tone: 'neutral' },
    ACCEPTED: { label: 'Connecting', tone: 'neutral' },
    CONNECTED: { label: 'In progress', tone: 'success' },
    ENDED: { label: outgoing ? 'Outgoing' : 'Incoming', tone: 'success' },
    REJECTED: { label: outgoing ? 'Declined' : 'You declined', tone: 'warning' },
    CANCELLED: { label: outgoing ? 'Cancelled' : 'Missed', tone: outgoing ? 'neutral' : 'error' },
    MISSED: { label: outgoing ? 'No answer' : 'Missed', tone: outgoing ? 'warning' : 'error' },
    FAILED: { label: 'Could not connect', tone: 'error' },
  };

  return byStatus[call.status];
}

export function formatCallTimestamp(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (date.toDateString() === now.toDateString()) {
    return `Today, ${time}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }
  const day = date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
  return `${day}, ${time}`;
}

export function resolvePhotoUrl(photoUrl: string | null, assetsBaseUrl: string): string | null {
  if (!photoUrl) {
    return null;
  }
  return photoUrl.startsWith('/') ? `${assetsBaseUrl}${photoUrl}` : photoUrl;
}

export function roleLabel(role: CallParticipant['role']): string {
  switch (role) {
    case 'DOCTOR':
      return 'Doctor';
    case 'LABORATORIAN':
      return 'Laboratory';
    default:
      return 'Patient';
  }
}
