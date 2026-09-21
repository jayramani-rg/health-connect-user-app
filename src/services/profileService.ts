import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { PatientProfile, UpdatePatientProfileRequest } from '../features/patients/types/patient.types';

export const profileService = {
  getMyProfile: (): Promise<ApiResponse<PatientProfile>> => API.request<PatientProfile>('/patient-profile/me', { method: 'GET' }),

  updateMyProfile: (payload: UpdatePatientProfileRequest): Promise<ApiResponse<PatientProfile>> =>
    API.request<PatientProfile>('/patient-profile/me', { method: 'PUT', body: payload }),

  uploadMyPhoto: (file: { uri: string; name: string; type: string }): Promise<ApiResponse<PatientProfile>> => {
    const body = new FormData();
    body.append('file', file as unknown as Blob);
    return API.request<PatientProfile>('/patient-profile/me/photo', { method: 'POST', body });
  },

  removeMyPhoto: (): Promise<ApiResponse<PatientProfile>> => API.request<PatientProfile>('/patient-profile/me/photo', { method: 'DELETE' }),
};
