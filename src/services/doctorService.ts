import { API } from '../api';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';
import type { DoctorDetail, DoctorListItem, DoctorListQuery } from '../features/doctors/types/doctor.types';

function buildQuery<T extends object>(params: T): string {
  const search = new URLSearchParams();
  Object.entries(params as Record<string, string | number | undefined>).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const doctorService = {
  list: (query: DoctorListQuery = {}): Promise<ApiResponse<PaginatedResponse<DoctorListItem>>> =>
    API.request<PaginatedResponse<DoctorListItem>>(`/doctors${buildQuery(query)}`, { method: 'GET' }),

  getById: (doctorProfileId: string): Promise<ApiResponse<DoctorDetail>> =>
    API.request<DoctorDetail>(`/doctors/${doctorProfileId}`, { method: 'GET' }),
};
