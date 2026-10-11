import type { MeetingStatus } from '../types/meeting.types';

export function meetingStatusLabel(status: MeetingStatus): string {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In progress';
    case 'COMPLETED':
      return 'Completed';
    case 'WAITING':
      return 'Waiting to start';
    case 'CANCELLED':
      return 'Cancelled';
    case 'NO_SHOW':
      return 'No show';
    default:
      return 'Scheduled';
  }
}

export function formatMeetingDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe < 60) {
    return `${safe} sec`;
  }
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`;
}

export const NOTE_FIELDS = [
  { key: 'summary', label: 'Summary' },
  { key: 'keyPoints', label: 'Key points' },
  { key: 'patientConcerns', label: 'Patient concerns' },
  { key: 'followUp', label: 'Follow up' },
  { key: 'actionItems', label: 'Action items' },
  { key: 'nextSteps', label: 'Next steps' },
] as const;
