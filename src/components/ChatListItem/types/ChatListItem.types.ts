import type { ChatConversationListItem } from '../../../features/chat/types/chat.types';

export interface ChatListItemProps {
  conversation: ChatConversationListItem;
  onPress: () => void;
}
