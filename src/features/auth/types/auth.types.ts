export type AuthRole = 'PATIENT';

export interface AuthUser {
  id: string;
  phone: string | null;
  role: 'USER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isPhoneVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface LoginPayload {
  role: AuthRole;
  mobileNumber: string;
  password: string;
  deviceId?: string;
  platform?: 'IOS' | 'ANDROID' | 'WEB';
  fcmToken?: string;
  deviceName?: string;
}

export interface LoginResult {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  refreshTokenExpiresIn: number | null;
  user: AuthUser | null;
  registrationCompleted: boolean;
  profileActive: boolean;
  redirect: 'HOME' | 'RESUME_REGISTRATION' | 'START_REGISTRATION' | 'LOGIN';
}

export type OtpPurpose = 'REGISTRATION' | 'LOGIN' | 'FORGOT_PASSWORD' | 'MOBILE_VERIFICATION';

export interface OtpSentResult {
  mobileNumber: string;
  expiresInSeconds: number;
  message: string;
}

export interface OtpVerifiedResult {
  mobileNumber: string;
  purpose: string;
  verificationToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}
