// features/doctors/types/doctor.types.ts
// Mirrors HealthConnect.Application.Dtos.Doctors on the backend — keep in sync with GET /doctors.

export interface DoctorListItem {
  doctorProfileId: string;
  fullName: string;
  specialization: string;
  subSpecialization: string | null;
  experienceYears: number;
  consultationFee: number;
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

export interface DoctorAvailabilitySummary {
  workingDays: string[];
  dailyStartTime: string;
  dailyEndTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
  inClinicEnabled: boolean;
  inClinicFee: number | null;
  inClinicDurationMinutes: number | null;
  videoEnabled: boolean;
  videoFee: number | null;
  videoDurationMinutes: number | null;
  voiceEnabled: boolean;
  voiceFee: number | null;
  voiceDurationMinutes: number | null;
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
