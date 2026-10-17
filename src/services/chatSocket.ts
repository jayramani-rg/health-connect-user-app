import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '../config/env';
import type { ChatInvitation, ChatMessage, MessagesReadEvent } from '../features/chat/types/chat.types';
import type { AppNotification } from '../features/notifications/types/notification.types';
import type { BookingRequest, DoctorSlotsChangedEvent } from '../features/appointments/types/appointment.types';

type MessageHandler = (message: ChatMessage) => void;
type InvitationHandler = (invitation: ChatInvitation) => void;
type ReadHandler = (event: MessagesReadEvent) => void;
type NotificationHandler = (notification: AppNotification) => void;
type BookingRequestHandler = (request: BookingRequest) => void;
type SlotsChangedHandler = (event: DoctorSlotsChangedEvent) => void;
type ReconnectHandler = () => void;

class ChatSocket {
  private connection: HubConnection | null = null;
  private getToken: () => string | null = () => null;
  private messageHandlers = new Set<MessageHandler>();
  private invitationHandlers = new Set<InvitationHandler>();
  private readHandlers = new Set<ReadHandler>();
  private notificationHandlers = new Set<NotificationHandler>();
  private bookingRequestHandlers = new Set<BookingRequestHandler>();
  private slotsChangedHandlers = new Set<SlotsChangedHandler>();
  private reconnectHandlers = new Set<ReconnectHandler>();
  private watchedDoctors = new Map<string, number>();

  configure(getToken: () => string | null): void {
    this.getToken = getToken;
  }

  async connect(): Promise<void> {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, { accessTokenFactory: () => this.getToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (message: ChatMessage) => this.messageHandlers.forEach((h) => h(message)));
    connection.on('InvitationReceived', (invitation: ChatInvitation) => this.invitationHandlers.forEach((h) => h(invitation)));
    connection.on('InvitationAccepted', (invitation: ChatInvitation) => this.invitationHandlers.forEach((h) => h(invitation)));
    connection.on('InvitationRejected', (invitation: ChatInvitation) => this.invitationHandlers.forEach((h) => h(invitation)));
    connection.on('MessagesRead', (event: MessagesReadEvent) => this.readHandlers.forEach((h) => h(event)));
    connection.on('NotificationReceived', (notification: AppNotification) => this.notificationHandlers.forEach((h) => h(notification)));
    connection.on('BookingRequestUpdated', (request: BookingRequest) => this.bookingRequestHandlers.forEach((h) => h(request)));
    connection.on('DoctorSlotsChanged', (event: DoctorSlotsChangedEvent) => this.slotsChangedHandlers.forEach((h) => h(event)));
    connection.onreconnected(() => {
      this.rejoinWatchedDoctors();
      this.reconnectHandlers.forEach((h) => h());
    });

    this.connection = connection;

    try {
      await connection.start();
      this.rejoinWatchedDoctors();
    } catch {
    }
  }

  private rejoinWatchedDoctors(): void {
    const connection = this.connection;
    if (connection?.state !== HubConnectionState.Connected) {
      return;
    }
    this.watchedDoctors.forEach((_, doctorProfileId) => {
      connection.invoke('WatchDoctorSlots', doctorProfileId).catch(() => undefined);
    });
  }

  async watchDoctorSlots(doctorProfileId: string): Promise<void> {
    this.watchedDoctors.set(doctorProfileId, (this.watchedDoctors.get(doctorProfileId) ?? 0) + 1);
    await this.connect();
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('WatchDoctorSlots', doctorProfileId);
      } catch {
      }
    }
  }

  async unwatchDoctorSlots(doctorProfileId: string): Promise<void> {
    const count = (this.watchedDoctors.get(doctorProfileId) ?? 1) - 1;
    if (count > 0) {
      this.watchedDoctors.set(doctorProfileId, count);
      return;
    }
    this.watchedDoctors.delete(doctorProfileId);
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('UnwatchDoctorSlots', doctorProfileId);
      } catch {
      }
    }
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  onBookingRequestUpdated(handler: BookingRequestHandler): () => void {
    this.bookingRequestHandlers.add(handler);
    return () => this.bookingRequestHandlers.delete(handler);
  }

  onDoctorSlotsChanged(handler: SlotsChangedHandler): () => void {
    this.slotsChangedHandlers.add(handler);
    return () => this.slotsChangedHandlers.delete(handler);
  }

  onReconnected(handler: ReconnectHandler): () => void {
    this.reconnectHandlers.add(handler);
    return () => this.reconnectHandlers.delete(handler);
  }

  async disconnect(): Promise<void> {
    const connection = this.connection;
    this.connection = null;
    try {
      await connection?.stop();
    } catch {
    }
  }

  async joinConversation(conversationId: string): Promise<void> {
    await this.connect();
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinConversation', conversationId);
      } catch {
      }
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveConversation', conversationId);
      } catch {
      }
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onInvitation(handler: InvitationHandler): () => void {
    this.invitationHandlers.add(handler);
    return () => this.invitationHandlers.delete(handler);
  }

  onMessagesRead(handler: ReadHandler): () => void {
    this.readHandlers.add(handler);
    return () => this.readHandlers.delete(handler);
  }

  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    return () => this.notificationHandlers.delete(handler);
  }
}

export const chatSocket = new ChatSocket();
