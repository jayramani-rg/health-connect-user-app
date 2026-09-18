export type ChatProviderType = 'DOCTOR' | 'LABORATORY';
export type ChatInvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface ChatInvitation {
  id: string;
  providerType: ChatProviderType;
  status: ChatInvitationStatus;
  initiatedByRole: string;
  message: string | null;
  rejectionReason: string | null;
  patientUserId: string;
  patientName: string | null;
  doctorProfileId: string | null;
  doctorName: string | null;
  doctorSpecialization: string | null;
  laboratoryId: string | null;
  laboratoryName: string | null;
  conversationId: string | null;
  createdAt: string;
  respondedAtUtc: string | null;
}

export interface ChatConversationListItem {
  id: string;
  providerType: ChatProviderType;
  doctorProfileId: string | null;
  doctorName: string | null;
  doctorSpecialization: string | null;
  laboratoryId: string | null;
  laboratoryName: string | null;
  patientUserId: string;
  patientName: string | null;
  lastMessageBody: string | null;
  lastMessageAtUtc: string | null;
  unreadCount: number;
}

export interface ChatConversationDetail extends ChatConversationListItem {
  invitationId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  isFromPatient: boolean;
  body: string;
  sentAtUtc: string;
  readAtUtc: string | null;
}

export interface ChatMessagePage {
  items: ChatMessage[];
  hasMore: boolean;
  nextBeforeSentAtUtc: string | null;
  nextBeforeId: string | null;
}

/** Client-only shape for an optimistic outgoing message that hasn't been confirmed by the server yet. */
export interface OutgoingChatMessage extends ChatMessage {
  clientId: string;
  sendState: 'sending' | 'sent' | 'failed';
}

export interface MessagesReadEvent {
  conversationId: string;
  messageIds: string[];
  readAtUtc: string;
}
