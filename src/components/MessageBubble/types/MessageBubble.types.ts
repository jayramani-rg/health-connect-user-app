import type { ChatMessage, OutgoingChatMessage } from '../../../features/chat/types/chat.types';

export interface MessageBubbleProps {
  message: ChatMessage | OutgoingChatMessage;
  isMine: boolean;
  onRetry?: () => void;
}
