// features/appointments/types/appointment.types.ts
// Mirrors HealthConnect.Application.Dtos.Appointments on the backend — keep in sync with the
// AppointmentsController/DoctorAvailabilityController contracts.

import type { ConsultationType } from '../../doctors/types/doctor.types';

export type { ConsultationType };

export type AppointmentStatus =
  | 'PENDING'
  | 'RESCHEDULE_PROPOSED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NO_SHOW';

export interface AppointmentListItem {
  id: string;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  scheduledStartAtUtc: string;
  durationMinutes: number;
  doctorProfileId: string;
  doctorName: string;
  doctorSpecialization: string | null;
  patientUserId: string;
  patientName: string | null;
  consultationFee: number;
}

export interface ConsultationInfo {
  id: string;
  status: 'NOT_STARTED' | 'ACTIVE' | 'ENDED';
  roomIdentifier: string | null;
  startedAt: string | null;
  endedAt: string | null;
}

export interface AppointmentHistoryEntry {
  action: string;
  fromStatus: AppointmentStatus | null;
  toStatus: AppointmentStatus;
  actorRole: string | null;
  actorName: string | null;
  note: string | null;
  createdAt: string;
}

export interface AppointmentDetail {
  id: string;
  providerType: 'DOCTOR' | 'LAB';
  consultationType: ConsultationType;
  status: AppointmentStatus;
  scheduledStartAtUtc: string;
  durationMinutes: number;
  consultationFee: number;
  reason: string | null;
  clinicAddress: string | null;
  doctorProfileId: string;
  doctorName: string;
  doctorSpecialization: string | null;
  patientUserId: string;
  patientName: string | null;
  patientPhone: string | null;
  rescheduleProposedStartAtUtc: string | null;
  rescheduleProposedDurationMinutes: number | null;
  rescheduleNote: string | null;
  cancelledByRole: string | null;
  cancellationReason: string | null;
  rejectionReason: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  consultation: ConsultationInfo | null;
  history: AppointmentHistoryEntry[];
}

export interface BookAppointmentPayload {
  doctorProfileId: string;
  consultationType: ConsultationType;
  scheduledStartAtUtc: string;
  reason?: string;
}

export interface AppointmentQuery {
  status?: AppointmentStatus;
  consultationType?: ConsultationType;
  doctorProfileId?: string;
  patientUserId?: string;
  dateFromUtc?: string;
  dateToUtc?: string;
  page?: number;
  pageSize?: number;
}

export interface AvailableSlot {
  startAtUtc: string;
  durationMinutes: number;
}

export interface AvailableSlotsResponse {
  date: string;
  consultationType: ConsultationType;
  doctorAcceptingAppointments: boolean;
  slots: AvailableSlot[];
}

/// Client-side grouping only (the backend has no "category" concept — these are just AppointmentStatus sets).
export type AppointmentTab = 'upcoming' | 'pending' | 'past' | 'cancelled';

export const STATUS_BY_TAB: Record<AppointmentTab, AppointmentStatus[]> = {
  upcoming: ['CONFIRMED', 'IN_PROGRESS'],
  pending: ['PENDING', 'RESCHEDULE_PROPOSED'],
  past: ['COMPLETED', 'NO_SHOW'],
  cancelled: ['CANCELLED', 'REJECTED', 'EXPIRED'],
};
