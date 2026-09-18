import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type {
  ChatConversationDetail,
  ChatConversationListItem,
  ChatInvitation,
  ChatInvitationStatus,
  ChatMessage,
  ChatMessagePage,
  ChatProviderType,
} from '../features/chat/types/chat.types';

interface GetMessagesParams {
  beforeSentAtUtc?: string;
  beforeId?: string;
  pageSize?: number;
}

export const chatService = {
  listInvitations: (status?: ChatInvitationStatus): Promise<ApiResponse<ChatInvitation[]>> =>
    API.request<ChatInvitation[]>(`/chat/invitations${status ? `?status=${status}` : ''}`, { method: 'GET' }),

  sendInvitation: (providerType: ChatProviderType, providerId: string, message?: string): Promise<ApiResponse<ChatInvitation>> =>
    API.request<ChatInvitation>('/chat/invitations', { method: 'POST', body: { providerType, providerId, message } }),

  cancelInvitation: (id: string): Promise<ApiResponse<ChatInvitation>> =>
    API.request<ChatInvitation>(`/chat/invitations/${id}/cancel`, { method: 'POST' }),

  listConversations: (): Promise<ApiResponse<ChatConversationListItem[]>> =>
    API.request<ChatConversationListItem[]>('/chat/conversations', { method: 'GET' }),

  getConversation: (id: string): Promise<ApiResponse<ChatConversationDetail>> =>
    API.request<ChatConversationDetail>(`/chat/conversations/${id}`, { method: 'GET' }),

  getMessages: (conversationId: string, params: GetMessagesParams = {}): Promise<ApiResponse<ChatMessagePage>> => {
    const search = new URLSearchParams();
    if (params.beforeSentAtUtc) search.append('beforeSentAtUtc', params.beforeSentAtUtc);
    if (params.beforeId) search.append('beforeId', params.beforeId);
    if (params.pageSize) search.append('pageSize', String(params.pageSize));
    const qs = search.toString();
    return API.request<ChatMessagePage>(`/chat/conversations/${conversationId}/messages${qs ? `?${qs}` : ''}`, { method: 'GET' });
  },

  sendMessage: (conversationId: string, body: string): Promise<ApiResponse<ChatMessage>> =>
    API.request<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: { body } }),

  markRead: (conversationId: string): Promise<ApiResponse<null>> =>
    API.request<null>(`/chat/conversations/${conversationId}/read`, { method: 'POST' }),
};
