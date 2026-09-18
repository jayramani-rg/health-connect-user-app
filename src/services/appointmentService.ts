import { API } from '../api';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';
import type {
  AppointmentDetail,
  AppointmentListItem,
  AppointmentQuery,
  BookAppointmentPayload,
} from '../features/appointments/types/appointment.types';

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

export const appointmentService = {
  list: (query: AppointmentQuery = {}): Promise<ApiResponse<PaginatedResponse<AppointmentListItem>>> =>
    API.request<PaginatedResponse<AppointmentListItem>>(`/appointments${buildQuery(query)}`, { method: 'GET' }),

  getById: (id: string): Promise<ApiResponse<AppointmentDetail>> => API.request<AppointmentDetail>(`/appointments/${id}`, { method: 'GET' }),

  book: (payload: BookAppointmentPayload): Promise<ApiResponse<AppointmentDetail>> =>
    API.request<AppointmentDetail>('/appointments', { method: 'POST', body: payload }),

  cancel: (id: string, reason?: string): Promise<ApiResponse<AppointmentDetail>> =>
    API.request<AppointmentDetail>(`/appointments/${id}/cancel`, { method: 'POST', body: { reason } }),

  respondToReschedule: (id: string, accept: boolean): Promise<ApiResponse<AppointmentDetail>> =>
    API.request<AppointmentDetail>(`/appointments/${id}/respond-reschedule`, { method: 'POST', body: { accept } }),
};
