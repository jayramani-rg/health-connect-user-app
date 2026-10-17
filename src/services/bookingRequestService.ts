import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { BookingRequest, CreateBookingRequestPayload } from '../features/appointments/types/appointment.types';

export type BookingReleaseReason = 'CHECKOUT_CANCELLED' | 'PAYMENT_FAILED';

export const bookingRequestService = {
  create: (payload: CreateBookingRequestPayload): Promise<ApiResponse<BookingRequest>> =>
    API.request<BookingRequest>('/appointment-requests', { method: 'POST', body: payload }),

  getById: (id: string): Promise<ApiResponse<BookingRequest>> =>
    API.request<BookingRequest>(`/appointment-requests/${id}`, { method: 'GET' }),

  mine: (): Promise<ApiResponse<BookingRequest[]>> => API.request<BookingRequest[]>('/appointment-requests/mine', { method: 'GET' }),

  cancel: (id: string, reason?: BookingReleaseReason): Promise<ApiResponse<BookingRequest>> =>
    API.request<BookingRequest>(`/appointment-requests/${id}/cancel`, { method: 'POST', body: { reason } }),
};
