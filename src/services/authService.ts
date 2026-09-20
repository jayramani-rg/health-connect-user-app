import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type {
  AuthRole,
  CheckAccountResult,
  LoginPayload,
  LoginResult,
  OtpPurpose,
  OtpSentResult,
  OtpVerifiedResult,
} from '../features/auth/types/auth.types';

export const authService = {
  login: (payload: LoginPayload): Promise<ApiResponse<LoginResult>> =>
    API.request<LoginResult>('/auth/login', { method: 'POST', body: payload, skipAuth: true }),

  logout: (refreshToken?: string, allDevices = false): Promise<ApiResponse<string>> =>
    API.request<string>('/auth/logout', { method: 'POST', body: { refreshToken, allDevices } }),

  checkAccount: (mobileNumber: string, role: AuthRole = 'PATIENT'): Promise<ApiResponse<CheckAccountResult>> =>
    API.request<CheckAccountResult>('/auth/check-account', { method: 'POST', body: { mobileNumber, role }, skipAuth: true }),

  sendOtp: (mobileNumber: string, purpose: OtpPurpose): Promise<ApiResponse<OtpSentResult>> =>
    API.request<OtpSentResult>('/otp/send', { method: 'POST', body: { mobileNumber, purpose }, skipAuth: true }),

  resendOtp: (mobileNumber: string, purpose: OtpPurpose): Promise<ApiResponse<OtpSentResult>> =>
    API.request<OtpSentResult>('/otp/resend', { method: 'POST', body: { mobileNumber, purpose }, skipAuth: true }),

  verifyOtp: (mobileNumber: string, purpose: OtpPurpose, code: string): Promise<ApiResponse<OtpVerifiedResult>> =>
    API.request<OtpVerifiedResult>('/otp/verify', { method: 'POST', body: { mobileNumber, purpose, code }, skipAuth: true }),

  // The backend auto-authenticates the reset account when it can resolve it unambiguously (Role given,
  // which it always is here since this app only ever resets PATIENT accounts) — the response carries a
  // full login session, so no separate login call is needed after this succeeds.
  resetPassword: (verificationToken: string, newPassword: string, role: AuthRole = 'PATIENT'): Promise<ApiResponse<LoginResult>> =>
    API.request<LoginResult>('/password-reset', { method: 'POST', body: { verificationToken, newPassword, role }, skipAuth: true }),
};
