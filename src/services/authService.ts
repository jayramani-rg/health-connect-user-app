import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { LoginPayload, LoginResult, OtpPurpose, OtpSentResult, OtpVerifiedResult } from '../features/auth/types/auth.types';

export const authService = {
  login: (payload: LoginPayload): Promise<ApiResponse<LoginResult>> =>
    API.request<LoginResult>('/auth/login', { method: 'POST', body: payload, skipAuth: true }),

  logout: (refreshToken?: string, allDevices = false): Promise<ApiResponse<string>> =>
    API.request<string>('/auth/logout', { method: 'POST', body: { refreshToken, allDevices } }),

  sendOtp: (mobileNumber: string, purpose: OtpPurpose): Promise<ApiResponse<OtpSentResult>> =>
    API.request<OtpSentResult>('/otp/send', { method: 'POST', body: { mobileNumber, purpose }, skipAuth: true }),

  resendOtp: (mobileNumber: string, purpose: OtpPurpose): Promise<ApiResponse<OtpSentResult>> =>
    API.request<OtpSentResult>('/otp/resend', { method: 'POST', body: { mobileNumber, purpose }, skipAuth: true }),

  verifyOtp: (mobileNumber: string, purpose: OtpPurpose, code: string): Promise<ApiResponse<OtpVerifiedResult>> =>
    API.request<OtpVerifiedResult>('/otp/verify', { method: 'POST', body: { mobileNumber, purpose, code }, skipAuth: true }),

  resetPassword: (verificationToken: string, newPassword: string): Promise<ApiResponse<string>> =>
    API.request<string>('/password-reset', { method: 'POST', body: { verificationToken, newPassword }, skipAuth: true }),
};
