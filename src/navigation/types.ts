import type { OtpPurpose } from '../features/auth/types/auth.types';
import type { ConsultationType } from '../features/doctors/types/doctor.types';

export type RootStackParamList = {
  Welcome: undefined;
  MobileNumber: { mode: 'login' | 'register' };
  Otp: { mobileNumber: string; purpose: OtpPurpose; mode: 'register' | 'forgotPassword' };
  LoginPassword: { mobileNumber: string };
  CreatePassword: { verificationToken: string; mobileNumber: string; mode: 'register' | 'reset' };
  ProfileBasics: undefined;

  MainTabs: undefined;

  DoctorList: { consultationType?: ConsultationType; specialization?: string } | undefined;
  DoctorProfile: { doctorProfileId: string };
  BookAppointment: { doctorProfileId: string };
  AppointmentConfirmation: { appointmentId: string };
  AppointmentDetail: { appointmentId: string };

  WebViewScreen: { url: string; title: string };
  NoInternet: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Appointments: undefined;
};
