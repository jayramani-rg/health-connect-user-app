import { API } from '../api';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';
import type { AppNotification, NotificationQuery } from '../features/notifications/types/notification.types';

function buildQuery(params: NotificationQuery = {}): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export const notificationService = {
  list: (query: NotificationQuery = {}): Promise<ApiResponse<PaginatedResponse<AppNotification>>> =>
    API.request<PaginatedResponse<AppNotification>>(`/notifications${buildQuery(query)}`, { method: 'GET' }),

  unreadCount: (): Promise<ApiResponse<{ count: number }>> => API.request<{ count: number }>('/notifications/unread-count', { method: 'GET' }),

  markRead: (id: string): Promise<ApiResponse<null>> => API.request<null>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllRead: (): Promise<ApiResponse<null>> => API.request<null>('/notifications/read-all', { method: 'POST' }),
};
