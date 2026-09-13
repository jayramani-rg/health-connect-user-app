import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { LoginResult } from '../features/auth/types/auth.types';

export const registrationService = {
  createPatientPassword: (verificationToken: string, password: string): Promise<ApiResponse<LoginResult>> =>
    API.request<LoginResult>('/registration/patient/password', {
      method: 'POST',
      body: { verificationToken, password },
      skipAuth: true,
    }),
};
