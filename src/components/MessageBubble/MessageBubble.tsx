import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../Icon/Icon';
import { styles } from './styles/MessageBubble.styles';
import type { MessageBubbleProps } from './types/MessageBubble.types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function MessageBubble({ message, isMine, onRetry }: MessageBubbleProps) {
  const sendState = 'sendState' in message ? message.sendState : 'sent';

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.body, isMine ? styles.bodyMine : styles.bodyTheirs]}>{message.body}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>{formatTime(message.sentAtUtc)}</Text>
          {isMine && sendState === 'sending' && <ActivityIndicator size="small" color={colors.white} style={styles.metaIcon} />}
          {isMine && sendState === 'sent' && (
            <Icon name={message.readAtUtc ? 'checkmark-done' : 'checkmark'} size={14} color={colors.white} style={styles.metaIcon} />
          )}
          {isMine && sendState === 'failed' && (
            <TouchableOpacity onPress={onRetry} style={styles.metaIcon}>
              <Icon name="refresh" size={14} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export type { MessageBubbleProps };
