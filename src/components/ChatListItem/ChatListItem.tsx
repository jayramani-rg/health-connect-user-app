import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { activeopacity } from '../../utils/helpers';
import { Avatar } from '../Avatar/Avatar';
import { styles } from './styles/ChatListItem.styles';
import type { ChatListItemProps } from './types/ChatListItem.types';

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function ChatListItem({ conversation, onPress }: ChatListItemProps) {
  const name = conversation.providerType === 'DOCTOR' ? conversation.doctorName ?? 'Doctor' : conversation.laboratoryName ?? 'Laboratory';
  const subtitle = conversation.providerType === 'DOCTOR' ? conversation.doctorSpecialization : 'Laboratory';

  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.row} onPress={onPress}>
      <Avatar name={name} />
      <View style={styles.body}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(conversation.lastMessageAtUtc)}</Text>
        </View>
        <View style={styles.bottomLine}>
          <Text style={styles.preview} numberOfLines={1}>
            {conversation.lastMessageBody ?? (subtitle ? `${subtitle} · Say hello` : 'Say hello 👋')}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export type { ChatListItemProps };
