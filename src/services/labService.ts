import { API } from '../api';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';
import type { LabDetail, LabListItem, LabListQuery, LabServiceSearchQuery, LabServiceSearchResultItem } from '../features/labs/types/lab.types';

function buildQuery<T extends object>(params: T): string {
  const search = new URLSearchParams();
  Object.entries(params as Record<string, string | number | boolean | undefined>).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const labService = {
  list: (query: LabListQuery = {}): Promise<ApiResponse<PaginatedResponse<LabListItem>>> =>
    API.request<PaginatedResponse<LabListItem>>(`/labs${buildQuery(query)}`, { method: 'GET' }),

  getById: (laboratoryId: string): Promise<ApiResponse<LabDetail>> => API.request<LabDetail>(`/labs/${laboratoryId}`, { method: 'GET' }),

  // Cross-lab search by service/category — the backend for "browse by category, see every lab that
  // offers it" (route lives at /lab-services/search, not nested under /labs).
  searchServices: (query: LabServiceSearchQuery = {}): Promise<ApiResponse<PaginatedResponse<LabServiceSearchResultItem>>> =>
    API.request<PaginatedResponse<LabServiceSearchResultItem>>(`/lab-services/search${buildQuery(query)}`, { method: 'GET' }),
};
