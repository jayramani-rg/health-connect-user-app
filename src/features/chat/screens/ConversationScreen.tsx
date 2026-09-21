import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Icon } from '../../../components/Icon/Icon';
import { MessageBubble } from '../../../components/MessageBubble/MessageBubble';
import { colors, radius, spacing, typography } from '../../../theme';
import { chatService } from '../../../services/chatService';
import { chatSocket } from '../../../services/chatSocket';
import type { RootStackParamList } from '../../../navigation/types';
import type { ChatMessage, OutgoingChatMessage } from '../types/chat.types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatConversation'>;
type Row = ChatMessage | OutgoingChatMessage;

function isOutgoing(row: Row): row is OutgoingChatMessage {
  return 'clientId' in row;
}

function makeClientId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

type DisplayRow = { kind: 'message'; row: Row } | { kind: 'separator'; key: string; label: string };

function withDateSeparators(rows: Row[]): DisplayRow[] {
  const result: DisplayRow[] = [];
  for (let i = 0; i < rows.length; i++) {
    result.push({ kind: 'message', row: rows[i] });
    const currentDate = new Date(rows[i].sentAtUtc).toDateString();
    const nextDate = rows[i + 1] ? new Date(rows[i + 1].sentAtUtc).toDateString() : null;
    if (currentDate !== nextDate) {
      result.push({ kind: 'separator', key: `sep-${currentDate}`, label: formatDateLabel(rows[i].sentAtUtc) });
    }
  }
  return result;
}

const ConversationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { conversationId } = route.params;

  const [messages, setMessages] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState('');
  const cursorRef = useRef<{ beforeSentAtUtc?: string; beforeId?: string }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [conversationRes, messagesRes] = await Promise.all([
          chatService.getConversation(conversationId),
          chatService.getMessages(conversationId, { pageSize: 30 }),
        ]);
        if (!active) return;

        const conversation = conversationRes.data;
        const title = conversation.providerType === 'DOCTOR' ? conversation.doctorName ?? 'Doctor' : conversation.laboratoryName ?? 'Laboratory';
        navigation.setOptions({ title });

        setMessages(messagesRes.data.items);
        setHasMore(messagesRes.data.hasMore);
        cursorRef.current = {
          beforeSentAtUtc: messagesRes.data.nextBeforeSentAtUtc ?? undefined,
          beforeId: messagesRes.data.nextBeforeId ?? undefined,
        };

        chatService.markRead(conversationId).catch(() => {});
        chatSocket.joinConversation(conversationId);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
      chatSocket.leaveConversation(conversationId);
    };
  }, [conversationId, navigation]);

  useEffect(() => {
    const offMessage = chatSocket.onMessage((incoming) => {
      if (incoming.conversationId !== conversationId) return;
      setMessages((prev) => {
        if (prev.some((m) => !isOutgoing(m) && m.id === incoming.id)) return prev;
        return [incoming, ...prev];
      });
      if (!incoming.isFromPatient) {
        chatService.markRead(conversationId).catch(() => {});
      }
    });

    const offRead = chatSocket.onMessagesRead((event) => {
      if (event.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) => (!isOutgoing(m) && event.messageIds.includes(m.id) ? { ...m, readAtUtc: event.readAtUtc } : m)),
      );
    });

    return () => {
      offMessage();
      offRead();
    };
  }, [conversationId]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await chatService.getMessages(conversationId, { pageSize: 30, ...cursorRef.current });
      setMessages((prev) => [...prev, ...response.data.items]);
      setHasMore(response.data.hasMore);
      cursorRef.current = {
        beforeSentAtUtc: response.data.nextBeforeSentAtUtc ?? undefined,
        beforeId: response.data.nextBeforeId ?? undefined,
      };
    } finally {
      setLoadingMore(false);
    }
  }, [conversationId, hasMore, loadingMore]);

  async function sendMessage(body: string, clientId: string) {
    try {
      const response = await chatService.sendMessage(conversationId, body);
      setMessages((prev) => prev.map((m) => (isOutgoing(m) && m.clientId === clientId ? { ...response.data, clientId, sendState: 'sent' as const } : m)));
    } catch {
      setMessages((prev) => prev.map((m) => (isOutgoing(m) && m.clientId === clientId ? { ...m, sendState: 'failed' as const } : m)));
    }
  }

  function handleSend() {
    const body = draft.trim();
    if (!body) return;
    setDraft('');

    const clientId = makeClientId();
    const optimistic: OutgoingChatMessage = {
      id: clientId,
      clientId,
      conversationId,
      senderUserId: 'me',
      isFromPatient: true,
      body,
      sentAtUtc: new Date().toISOString(),
      readAtUtc: null,
      sendState: 'sending',
    };
    setMessages((prev) => [optimistic, ...prev]);
    sendMessage(body, clientId);
  }

  function handleRetry(clientId: string, body: string) {
    setMessages((prev) => prev.map((m) => (isOutgoing(m) && m.clientId === clientId ? { ...m, sendState: 'sending' as const } : m)));
    sendMessage(body, clientId);
  }

  const displayRows = useMemo(() => withDateSeparators(messages), [messages]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingWrapper} edges={['top', 'bottom']}>
        <ActivityIndicator color={colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          data={displayRows}
          inverted
          keyExtractor={(entry) => (entry.kind === 'separator' ? entry.key : isOutgoing(entry.row) ? entry.row.clientId : entry.row.id)}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.paginationSpinner} color={colors.brand} /> : undefined}
          renderItem={({ item: entry }) => {
            if (entry.kind === 'separator') {
              return (
                <View style={styles.dateSeparatorRow}>
                  <Text style={styles.dateSeparatorText}>{entry.label}</Text>
                </View>
              );
            }
            const row = entry.row;
            return (
              <MessageBubble
                message={row}
                isMine={row.isFromPatient}
                onRetry={isOutgoing(row) ? () => handleRetry(row.clientId, row.body) : undefined}
              />
            );
          }}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor={colors.textTertiary}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={4000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!draft.trim()}
          >
            <Icon name="send" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  flex: {
    flex: 1,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  paginationSpinner: {
    marginVertical: spacing.md,
  },
  dateSeparatorRow: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  dateSeparatorText: {
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.canvas,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderStrong,
  },
});

export default ConversationScreen;
