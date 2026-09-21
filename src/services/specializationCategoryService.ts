import { API } from '../api';
import type { ApiResponse } from '../types/common.types';

export interface ApprovedSpecializationCategory {
  id: string;
  name: string;
  imageUrl: string | null;
}

export const specializationCategoryService = {
  // Anonymous on the backend, but called post-login here — the patient app's "browse doctors by
  // specialization" entry point.
  getApproved: (): Promise<ApiResponse<ApprovedSpecializationCategory[]>> =>
    API.request<ApprovedSpecializationCategory[]>('/specialization-categories/approved', { method: 'GET' }),
};
