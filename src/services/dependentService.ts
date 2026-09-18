import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { Dependent, SaveDependentRequest } from '../features/patients/types/patient.types';

export const dependentService = {
  listMine: (): Promise<ApiResponse<Dependent[]>> => API.request<Dependent[]>('/dependents', { method: 'GET' }),

  create: (payload: SaveDependentRequest): Promise<ApiResponse<Dependent>> =>
    API.request<Dependent>('/dependents', { method: 'POST', body: payload }),

  update: (id: string, payload: SaveDependentRequest): Promise<ApiResponse<Dependent>> =>
    API.request<Dependent>(`/dependents/${id}`, { method: 'PUT', body: payload }),

  remove: (id: string): Promise<ApiResponse<string>> => API.request<string>(`/dependents/${id}`, { method: 'DELETE' }),
};
