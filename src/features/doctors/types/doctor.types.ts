export interface DoctorListItem {
  doctorProfileId: string;
  fullName: string;
  specialization: string;
  subSpecialization: string | null;
  experienceYears: number;
  minConsultationFee: number | null;
  profilePhotoUrl: string | null;
  inClinicEnabled: boolean;
  videoEnabled: boolean;
  voiceEnabled: boolean;
  isAcceptingAppointments: boolean;
  clinicLocality: string | null;
  clinicCity: string | null;
  localityMatch: LocalityMatch | null;
}

export type LocalityMatch = 'SAME_LOCALITY' | 'SAME_CITY' | 'OTHER';

export interface Qualification {
  degree: string;
  institution: string;
  passingYear: number;
}

export interface ScheduleRange {
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  day: string;
  ranges: ScheduleRange[];
}

export interface ConsultationTypeSchedule {
  enabled: boolean;
  fee: number | null;
  durationMinutes: number | null;
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
  clinicName: string | null;
  clinicAddress: string | null;
  clinicPincode: string | null;
  qualifications: Qualification[];
  availability: DoctorAvailabilitySummary | null;
}

export interface DoctorListQuery {
  specialization?: string;
  search?: string;
  consultationType?: ConsultationType;
  nearLocality?: string;
  nearCity?: string;
  page?: number;
  pageSize?: number;
}

export type ConsultationType = 'IN_CLINIC' | 'VIDEO' | 'VOICE';
