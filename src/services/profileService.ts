import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { PatientProfile, UpdatePatientProfileRequest } from '../features/patients/types/patient.types';

export const profileService = {
  getMyProfile: (): Promise<ApiResponse<PatientProfile>> => API.request<PatientProfile>('/patient-profile/me', { method: 'GET' }),

  updateMyProfile: (payload: UpdatePatientProfileRequest): Promise<ApiResponse<PatientProfile>> =>
    API.request<PatientProfile>('/patient-profile/me', { method: 'PUT', body: payload }),
};
