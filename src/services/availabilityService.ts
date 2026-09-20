import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { AvailableSlotsResponse, ConsultationType, SlotCountsResponse } from '../features/appointments/types/appointment.types';

export const availabilityService = {
  getAvailableSlots: (doctorProfileId: string, consultationType: ConsultationType, date: string): Promise<ApiResponse<AvailableSlotsResponse>> =>
    API.request<AvailableSlotsResponse>(
      `/doctor-availability/slots?doctorProfileId=${doctorProfileId}&consultationType=${consultationType}&date=${date}`,
      { method: 'GET' },
    ),

  // Powers the date-strip's "N slots available" preview for a run of days in one round trip instead
  // of one /slots call per visible day.
  getSlotCounts: (
    doctorProfileId: string,
    consultationType: ConsultationType,
    fromDate: string,
    days: number,
  ): Promise<ApiResponse<SlotCountsResponse>> =>
    API.request<SlotCountsResponse>(
      `/doctor-availability/slot-counts?doctorProfileId=${doctorProfileId}&consultationType=${consultationType}&fromDate=${fromDate}&days=${days}`,
      { method: 'GET' },
    ),
};
