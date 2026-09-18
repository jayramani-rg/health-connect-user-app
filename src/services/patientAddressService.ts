import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { PatientAddress, SavePatientAddressRequest } from '../features/patients/types/patient.types';

export const patientAddressService = {
  listMine: (): Promise<ApiResponse<PatientAddress[]>> => API.request<PatientAddress[]>('/patient-addresses', { method: 'GET' }),

  create: (payload: SavePatientAddressRequest): Promise<ApiResponse<PatientAddress>> =>
    API.request<PatientAddress>('/patient-addresses', { method: 'POST', body: payload }),

  update: (id: string, payload: SavePatientAddressRequest): Promise<ApiResponse<PatientAddress>> =>
    API.request<PatientAddress>(`/patient-addresses/${id}`, { method: 'PUT', body: payload }),

  remove: (id: string): Promise<ApiResponse<string>> => API.request<string>(`/patient-addresses/${id}`, { method: 'DELETE' }),
};
