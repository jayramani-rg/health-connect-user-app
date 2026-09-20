// features/doctors/types/doctor.types.ts
// Mirrors HealthConnect.Application.Dtos.Doctors on the backend — keep in sync with GET /doctors.

export interface DoctorListItem {
  doctorProfileId: string;
  fullName: string;
  specialization: string;
  subSpecialization: string | null;
  experienceYears: number;
  /** The lowest fee among this doctor's enabled, priced consultation types — null when none are
   * configured yet. Never assume a single "the" fee; show "Fee not available" when null. */
  minConsultationFee: number | null;
  profilePhotoUrl: string | null;
  inClinicEnabled: boolean;
  videoEnabled: boolean;
  voiceEnabled: boolean;
  isAcceptingAppointments: boolean;
}

export interface Qualification {
  degree: string;
  institution: string;
  passingYear: number;
}

export interface ScheduleRange {
  /** "HH:mm" 24-hour, IST wall-clock. */
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  /** Sunday..Saturday. */
  day: string;
  ranges: ScheduleRange[];
}

export interface ConsultationTypeSchedule {
  enabled: boolean;
  fee: number | null;
  durationMinutes: number | null;
  /** Only days with at least one configured range are included. */
  schedule: DaySchedule[];
}

export interface DoctorAvailabilitySummary {
  inClinic: ConsultationTypeSchedule;
  video: ConsultationTypeSchedule;
  voice: ConsultationTypeSchedule;
  maxAppointmentsPerDay: number | null;
  minNoticeHours: number;
  maxAdvanceBookingDays: number;
  autoExpiryHours: number;
  cancellationPolicy: string | null;
  isAcceptingAppointments: boolean;
}

export interface DoctorDetail extends DoctorListItem {
  bio: string | null;
  qualifications: Qualification[];
  availability: DoctorAvailabilitySummary | null;
}

export interface DoctorListQuery {
  specialization?: string;
  search?: string;
  consultationType?: ConsultationType;
  page?: number;
  pageSize?: number;
}

export type ConsultationType = 'IN_CLINIC' | 'VIDEO' | 'VOICE';
