import { API } from '../api';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';
import type { LabDetail, LabListItem, LabListQuery } from '../features/labs/types/lab.types';

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
};
