import { API } from '../api';
import type { ApiResponse } from '../types/common.types';

export interface ApprovedLabTestCategory {
  id: string;
  name: string;
}

export const labTestCategoryService = {
  // Anonymous on the backend, but called post-login here — the patient app's "browse lab tests by
  // category" entry point.
  getApproved: (): Promise<ApiResponse<ApprovedLabTestCategory[]>> =>
    API.request<ApprovedLabTestCategory[]>('/lab-test-categories/approved', { method: 'GET' }),
};
