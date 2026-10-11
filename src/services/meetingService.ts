import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { Meeting } from '../features/meetings/types/meeting.types';

export const meetingService = {
  getByAppointment: (appointmentId: string): Promise<ApiResponse<Meeting | null>> =>
    API.request<Meeting | null>(`/meetings/appointment/${appointmentId}`, { method: 'GET' }),
};
