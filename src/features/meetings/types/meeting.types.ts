import type { Call } from '../../calls/types/call.types';

export type MeetingStatus = 'SCHEDULED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface MeetingNote {
  summary: string | null;
  keyPoints: string | null;
  doctorNotes: string | null;
  patientConcerns: string | null;
  followUp: string | null;
  actionItems: string | null;
  nextSteps: string | null;
  sharedWithPatient: boolean;
  sharedWithPatientAt: string | null;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  appointmentId: string;
  meetingType: 'VOICE' | 'VIDEO';
  status: MeetingStatus;
  startedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  recordingEnabled: boolean;
  recordingStatus: string;
  transcriptStatus: string;
  notesStatus: 'NONE' | 'DRAFT' | 'SHARED';
  calls: Call[];
  note: MeetingNote | null;
  canEditNotes: boolean;
}

export interface MeetingNoteInput {
  summary: string;
  keyPoints: string;
  doctorNotes: string;
  patientConcerns: string;
  followUp: string;
  actionItems: string;
  nextSteps: string;
}
