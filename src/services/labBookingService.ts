import { API } from '../api';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';
import type {
  AvailableLabSlotsResponse,
  BookLabServicePayload,
  CollectionMethod,
  HomeCollectionEligibility,
  LabBookingDetail,
  LabBookingListItem,
  LabBookingQuery,
  LabSlotCountsResponse,
} from '../features/labBookings/types/labBooking.types';

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

export const labBookingService = {
  list: (query: LabBookingQuery = {}): Promise<ApiResponse<PaginatedResponse<LabBookingListItem>>> =>
    API.request<PaginatedResponse<LabBookingListItem>>(`/lab-bookings${buildQuery(query)}`, { method: 'GET' }),

  getById: (id: string): Promise<ApiResponse<LabBookingDetail>> => API.request<LabBookingDetail>(`/lab-bookings/${id}`, { method: 'GET' }),

  book: (payload: BookLabServicePayload): Promise<ApiResponse<LabBookingDetail>> =>
    API.request<LabBookingDetail>('/lab-bookings', { method: 'POST', body: payload }),

  cancel: (id: string, reason?: string): Promise<ApiResponse<LabBookingDetail>> =>
    API.request<LabBookingDetail>(`/lab-bookings/${id}/cancel`, { method: 'POST', body: { reason } }),

  getAvailableSlots: (
    laboratoryId: string,
    collectionMethod: CollectionMethod,
    date: string,
    includeTaken = false,
  ): Promise<ApiResponse<AvailableLabSlotsResponse>> =>
    API.request<AvailableLabSlotsResponse>(
      `/lab-availability/slots?laboratoryId=${laboratoryId}&collectionMethod=${collectionMethod}&date=${date}${includeTaken ? '&includeTaken=true' : ''}`,
      { method: 'GET' },
    ),

  getSlotCounts: (laboratoryId: string, collectionMethod: CollectionMethod, fromDate: string, days: number): Promise<ApiResponse<LabSlotCountsResponse>> =>
    API.request<LabSlotCountsResponse>(
      `/lab-availability/slot-counts?laboratoryId=${laboratoryId}&collectionMethod=${collectionMethod}&fromDate=${fromDate}&days=${days}`,
      { method: 'GET' },
    ),

  checkHomeCollectionEligibility: (laboratoryId: string, patientAddressId: string): Promise<ApiResponse<HomeCollectionEligibility>> =>
    API.request<HomeCollectionEligibility>(
      `/lab-bookings/home-collection-eligibility${buildQuery({ laboratoryId, patientAddressId })}`,
      { method: 'GET' },
    ),

  reportDownloadPath: (bookingId: string, reportId: string): string => `/lab-bookings/${bookingId}/reports/${reportId}/download`,
};
