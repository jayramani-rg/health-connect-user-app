import { API } from '../api';
import type { ApiResponse } from '../types/common.types';

export interface ApprovedLabTestCategory {
  id: string;
  name: string;
  imageUrl: string | null;
}

export const labTestCategoryService = {
  getApproved: (): Promise<ApiResponse<ApprovedLabTestCategory[]>> =>
    API.request<ApprovedLabTestCategory[]>('/lab-test-categories/approved', { method: 'GET' }),
};
