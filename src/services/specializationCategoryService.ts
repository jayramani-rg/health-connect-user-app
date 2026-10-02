import { API } from '../api';
import type { ApiResponse } from '../types/common.types';

export interface ApprovedSpecializationCategory {
  id: string;
  name: string;
  imageUrl: string | null;
}

export const specializationCategoryService = {
  getApproved: (): Promise<ApiResponse<ApprovedSpecializationCategory[]>> =>
    API.request<ApprovedSpecializationCategory[]>('/specialization-categories/approved', { method: 'GET' }),
};
