import type { CallType } from '../types/call.types';

export const CALL_OPENS_BEFORE_MINUTES = 15;
export const CALL_GRACE_MINUTES = 15;

export interface CallableAppointment {
  consultationType: string;
  status: string;
  scheduledStartAtUtc: string;
  durationMinutes: number;
}

export type AppointmentCallAvailability =
  | { visible: false }
  | { visible: true; callType: CallType; enabled: boolean; hint: string | null };

export function callTypeForConsultation(consultationType: string): CallType | null {
  if (consultationType === 'VOICE') {
    return 'VOICE';
  }
  if (consultationType === 'VIDEO') {
    return 'VIDEO';
  }
  return null;
}

export function resolveAppointmentCall(appointment: CallableAppointment, now: Date = new Date()): AppointmentCallAvailability {
  const callType = callTypeForConsultation(appointment.consultationType);
  if (!callType) {
    return { visible: false };
  }

  if (appointment.status === 'IN_PROGRESS') {
    return { visible: true, callType, enabled: true, hint: null };
  }

  if (appointment.status !== 'CONFIRMED') {
    return { visible: false };
  }

  const start = Date.parse(appointment.scheduledStartAtUtc);
  const opensAt = start - CALL_OPENS_BEFORE_MINUTES * 60000;
  const closesAt = start + (appointment.durationMinutes + CALL_GRACE_MINUTES) * 60000;
  const nowMs = now.getTime();

  if (nowMs < opensAt) {
    return { visible: true, callType, enabled: false, hint: `Calls open ${CALL_OPENS_BEFORE_MINUTES} minutes before the appointment time.` };
  }
  if (nowMs > closesAt) {
    return { visible: true, callType, enabled: false, hint: 'The call window for this appointment has closed.' };
  }

  return { visible: true, callType, enabled: true, hint: null };
}
