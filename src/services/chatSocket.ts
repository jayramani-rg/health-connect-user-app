import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '../config/env';
import type { ChatInvitation, ChatMessage, MessagesReadEvent } from '../features/chat/types/chat.types';
import type { AppNotification } from '../features/notifications/types/notification.types';

type MessageHandler = (message: ChatMessage) => void;
type InvitationHandler = (invitation: ChatInvitation) => void;
type ReadHandler = (event: MessagesReadEvent) => void;
type NotificationHandler = (notification: AppNotification) => void;

class ChatSocket {
  private connection: HubConnection | null = null;
  private getToken: () => string | null = () => null;
  private messageHandlers = new Set<MessageHandler>();
  private invitationHandlers = new Set<InvitationHandler>();
  private readHandlers = new Set<ReadHandler>();
  private notificationHandlers = new Set<NotificationHandler>();

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

    this.connection = connection;

    try {
      await connection.start();
    } catch {
    }
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
