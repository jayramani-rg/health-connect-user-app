export type NotificationType =
  | 'CHAT_NEW_MESSAGE'
  | 'CHAT_INVITATION_RECEIVED'
  | 'CHAT_INVITATION_ACCEPTED'
  | 'CHAT_INVITATION_REJECTED'
  | 'CHAT_INVITATION_EXPIRED'
  | 'APPOINTMENT_REQUESTED'
  | 'APPOINTMENT_ACCEPTED'
  | 'APPOINTMENT_REJECTED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'APPOINTMENT_STARTING'
  | 'APPOINTMENT_COMPLETED'
  | 'APPOINTMENT_NO_SHOW'
  | 'APPOINTMENT_EXPIRED'
  | 'LAB_BOOKING_REQUESTED'
  | 'LAB_BOOKING_ACCEPTED'
  | 'LAB_BOOKING_REJECTED'
  | 'LAB_BOOKING_CANCELLED'
  | 'LAB_BOOKING_EXPIRED'
  | 'LAB_COLLECTOR_ASSIGNED'
  | 'LAB_SAMPLE_COLLECTED'
  | 'LAB_REPORT_UPLOADED'
  | 'PROFILE_VERIFICATION_STATUS'
  | 'PROFILE_REVERIFICATION_REQUIRED';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  readAtUtc: string | null;
  createdAt: string;
}

export interface NotificationQuery {
  isRead?: boolean;
  page?: number;
  pageSize?: number;
}
