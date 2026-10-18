import type { ConsultationType } from '../../doctors/types/doctor.types';

export type { ConsultationType };

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NO_SHOW'
  | 'PAYMENT_PENDING';

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

export type SlotStatus = 'AVAILABLE' | 'RESERVED' | 'BOOKED' | 'UNAVAILABLE';

export type SlotUnavailableReason = 'TOO_SOON' | 'DAY_FULL';

export interface AvailableSlot {
  startAtUtc: string;
  durationMinutes: number;
  status?: SlotStatus;
  unavailableReason?: SlotUnavailableReason | null;
  heldByMe?: boolean;
  waitingByMe?: boolean;
  queueLength?: number;
}

export type BookingRequestStatus = 'WAITING' | 'RESERVED' | 'CONFIRMED' | 'RELEASED' | 'LEFT' | 'CLOSED';

export type BookingRequestReason =
  | 'EXPIRED'
  | 'CHECKOUT_CANCELLED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'SLOT_TAKEN'
  | 'SLOT_UNAVAILABLE'
  | 'SLOT_PASSED'
  | 'LATE_PAYMENT_REINSTATED';

export interface BookingRequest {
  id: string;
  status: BookingRequestStatus;
  statusReason: BookingRequestReason | null;
  doctorProfileId: string;
  doctorName: string | null;
  consultationType: ConsultationType;
  scheduledStartAtUtc: string;
  durationMinutes: number;
  queuePosition: number | null;
  appointmentId: string | null;
  appointmentStatus: AppointmentStatus | null;
  reservationExpiresAtUtc: string | null;
  consultationFee: number | null;
  requiresPayment: boolean;
  createdAt: string;
  updatedAt: string;
  serverTimeUtc: string;
}

export interface CreateBookingRequestPayload {
  doctorProfileId: string;
  consultationType: ConsultationType;
  scheduledStartAtUtc: string;
  reason?: string;
  idempotencyKey: string;
}

export interface DoctorSlotsChangedEvent {
  doctorProfileId: string;
  date: string | null;
}

export interface AvailableSlotsResponse {
  date: string;
  consultationType: ConsultationType;
  doctorAcceptingAppointments: boolean;
  dayStatus?: DayAvailabilityStatus;
  slots: AvailableSlot[];
}

export type DayAvailabilityStatus = 'AVAILABLE' | 'FULL' | 'NO_SLOTS';

export interface DaySlotCount {
  date: string;
  availableCount: number;
  totalCount?: number;
  status?: DayAvailabilityStatus;
}

export interface DayAvailability {
  status: DayAvailabilityStatus;
  availableCount: number;
}

export interface SlotCountsResponse {
  doctorAcceptingAppointments: boolean;
  days: DaySlotCount[];
}

export type AppointmentTab = 'upcoming' | 'pending' | 'past' | 'cancelled';

export const STATUS_BY_TAB: Record<AppointmentTab, AppointmentStatus[]> = {
  upcoming: ['CONFIRMED', 'IN_PROGRESS'],
  pending: ['PAYMENT_PENDING', 'PENDING'],
  past: ['COMPLETED', 'NO_SHOW'],
  cancelled: ['CANCELLED', 'REJECTED', 'EXPIRED'],
};
