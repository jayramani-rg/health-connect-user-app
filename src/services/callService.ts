import { API } from '../api';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';
import type {
  Call,
  CallClientEndReason,
  CallContextRef,
  CallHistoryQuery,
  CallType,
  IceConfig,
} from '../features/calls/types/call.types';

function buildQuery(params: CallHistoryQuery = {}): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const callService = {
  start: (callType: CallType, context: CallContextRef): Promise<ApiResponse<Call>> =>
    API.request<Call>('/calls', { method: 'POST', body: { callType, ...context } }),

  accept: (id: string): Promise<ApiResponse<Call>> => API.request<Call>(`/calls/${id}/accept`, { method: 'POST' }),

  reject: (id: string): Promise<ApiResponse<Call>> => API.request<Call>(`/calls/${id}/reject`, { method: 'POST' }),

  cancel: (id: string): Promise<ApiResponse<Call>> => API.request<Call>(`/calls/${id}/cancel`, { method: 'POST' }),

  markConnected: (id: string): Promise<ApiResponse<Call>> => API.request<Call>(`/calls/${id}/connected`, { method: 'POST' }),

  end: (id: string, reason: CallClientEndReason): Promise<ApiResponse<Call>> =>
    API.request<Call>(`/calls/${id}/end`, { method: 'POST', body: { reason } }),

  iceServers: (id: string): Promise<ApiResponse<IceConfig>> => API.request<IceConfig>(`/calls/${id}/ice-servers`, { method: 'GET' }),

  get: (id: string): Promise<ApiResponse<Call>> => API.request<Call>(`/calls/${id}`, { method: 'GET' }),

  getActive: (): Promise<ApiResponse<Call | null>> => API.request<Call | null>('/calls/active', { method: 'GET' }),

  history: (query: CallHistoryQuery = {}): Promise<ApiResponse<PaginatedResponse<Call>>> =>
    API.request<PaginatedResponse<Call>>(`/calls${buildQuery(query)}`, { method: 'GET' }),
};
