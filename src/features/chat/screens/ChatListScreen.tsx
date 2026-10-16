import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button/Button';
import { ChatListItem } from '../../../components/ChatListItem/ChatListItem';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { PageHeader } from '../../../components/PageHeader/PageHeader';
import { SegmentedControl } from '../../../components/SegmentedControl/SegmentedControl';
import { SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors, radius, spacing, typography } from '../../../theme';
import { chatService } from '../../../services/chatService';
import { chatSocket } from '../../../services/chatSocket';
import type { RootStackParamList } from '../../../navigation/types';
import type { ChatConversationListItem, ChatInvitation } from '../types/chat.types';
import { useTabBarInset } from '../../../components/FloatingTabBar/useTabBarInset';

type ChatTab = 'chats' | 'pending';

function ItemSeparator() {
  return <View style={styles.separator} />;
}

const TAB_OPTIONS: { label: string; value: ChatTab }[] = [
  { label: 'Chats', value: 'chats' },
  { label: 'Pending', value: 'pending' },
];

const ChatListScreen: React.FC = () => {
  const bottomInset = useTabBarInset();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<ChatTab>('chats');
  const [conversations, setConversations] = useState<ChatConversationListItem[]>([]);
  const [invitations, setInvitations] = useState<ChatInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const [conversationsRes, invitationsRes] = await Promise.all([
        chatService.listConversations(),
        chatService.listInvitations('PENDING'),
      ]);
      setConversations(conversationsRes.data);
      setInvitations(invitationsRes.data);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => {
    const offMessage = chatSocket.onMessage(() => load());
    const offInvitation = chatSocket.onInvitation(() => load());
    return () => {
      offMessage();
      offInvitation();
    };
  }, [load]);

  async function handleCancel(invitationId: string) {
    setCancellingId(invitationId);
    try {
      await chatService.cancelInvitation(invitationId);
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <PageHeader title="Messages" />
        <SegmentedControl
          accessibilityLabel="Conversations"
          options={TAB_OPTIONS.map((option) => (option.value === 'pending' ? { ...option, badge: invitations.length } : option))}
          value={tab}
          onChange={(v) => setTab(v as ChatTab)}
        />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <SkeletonList count={5} />
        </View>
      ) : tab === 'chats' ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => (
            <ChatListItem conversation={item} onPress={() => navigation.navigate('ChatConversation', { conversationId: item.id })} />
          )}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={[conversations.length === 0 ? styles.emptyContent : undefined, { paddingBottom: bottomInset }]}
          ListEmptyComponent={
            <EmptyState title="No chats yet" description="Accepted chat invitations with your doctors and labs will show up here." />
          }
        />
      ) : (
        <FlatList
          data={invitations}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          contentContainerStyle={[invitations.length === 0 ? styles.emptyContent : styles.listContent, { paddingBottom: bottomInset }]}
          renderItem={({ item }) => {
            const name = item.providerType === 'DOCTOR' ? item.doctorName ?? 'Doctor' : item.laboratoryName ?? 'Laboratory';
            return (
              <View style={styles.pendingCard}>
                <Text style={typography.bodyStrong}>{name}</Text>
                <Text style={styles.pendingSubtitle}>Waiting for {item.providerType === 'DOCTOR' ? 'the doctor' : 'the laboratory'} to accept</Text>
                <Button
                  label={cancellingId === item.id ? 'Cancelling…' : 'Cancel invitation'}
                  onPress={() => handleCancel(item.id)}
                  variant="ghost"
                  disabled={cancellingId === item.id}
                  fullWidth={false}
                  style={styles.cancelButton}
                />
              </View>
            );
          }}
          ListEmptyComponent={<EmptyState title="No pending invitations" description="Invitations you send to a doctor or lab appear here until they respond." />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  loadingWrapper: {
    padding: spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 44 + spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
  },
  listContent: {
    padding: spacing.lg,
  },
  pendingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pendingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    alignSelf: 'flex-start',
  },
});

export default ChatListScreen;
