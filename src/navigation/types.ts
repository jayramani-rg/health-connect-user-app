import type { NavigatorScreenParams } from '@react-navigation/native';
import type { OtpPurpose } from '../features/auth/types/auth.types';
import type { ConsultationType } from '../features/doctors/types/doctor.types';

export type RootStackParamList = {
  Welcome: undefined;
  MobileNumber: undefined;
  Otp: { mobileNumber: string; purpose: OtpPurpose; mode: 'register' | 'forgotPassword' };
  LoginPassword: { mobileNumber: string };
  CreatePassword: { verificationToken: string; mobileNumber: string; mode: 'register' | 'reset' };
  ProfileBasics: undefined;

  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  DoctorCategories: undefined;
  DoctorList: { consultationType?: ConsultationType; specialization?: string; search?: string } | undefined;
  DoctorProfile: { doctorProfileId: string };
  BookAppointment: { doctorProfileId: string; consultationType?: ConsultationType };
  PaymentSummary: { kind: 'APPOINTMENT' | 'LAB_BOOKING'; bookingId: string };
  AppointmentConfirmation: { appointmentId: string };
  AppointmentDetail: { appointmentId: string };

  LabCategories: undefined;
  LabList: { category?: string } | undefined;
  LabProfile: { laboratoryId: string };
  BookLabService: { laboratoryId: string; serviceIds: string[] };
  LabBookingConfirmation: { bookingId: string };
  LabBookingDetail: { bookingId: string };
  ReportViewer: { bookingId: string; reportId: string; label: string; mimeType: string };

  ChatList: undefined;
  ChatConversation: { conversationId: string };

  NotificationCenter: undefined;
  IncomingCall: undefined;
  Calling: undefined;
  CallHistory: undefined;
  EditProfile: undefined;
  FamilyMembers: undefined;

  SelectLocation: undefined;
  SavedAddresses: undefined;
  AddressEditor: { addressId?: string } | undefined;
  Settings: undefined;
  HelpSupport: undefined;

  WebViewScreen: { url: string; title: string };
  NoInternet: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Book: undefined;
  Appointments: { initialMode?: 'DOCTOR' | 'LAB' } | undefined;
  Profile: undefined;
};
