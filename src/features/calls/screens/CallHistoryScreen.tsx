import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../../components/Avatar/Avatar';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { Icon } from '../../../components/Icon/Icon';
import { ASSETS_BASE_URL } from '../../../config/env';
import { callService } from '../../../services/callService';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { CallButtons } from '../components/CallButtons';
import { useCall } from '../context/CallContextValue';
import type { Call, CallContextRef } from '../types/call.types';
import { describeHistoryStatus, formatCallTimestamp, formatDuration, isOutgoing, otherParticipant, resolvePhotoUrl } from '../utils/callFormat';

const PAGE_SIZE = 20;

function contextOf(call: Call): CallContextRef | null {
  if (call.conversationId) {
    return { conversationId: call.conversationId };
  }
  if (call.appointmentId) {
    return { appointmentId: call.appointmentId };
  }
  if (call.labBookingId) {
    return { labBookingId: call.labBookingId };
  }
  return null;
}

const TONE_COLORS = {
  success: colors.success,
  neutral: colors.textSecondary,
  warning: colors.warning,
  error: colors.error,
};

const CallHistoryScreen: React.FC = () => {
  const { userId } = useCall();
  const [items, setItems] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);

  const loadPage = useCallback(async (page: number) => {
    const response = await callService.history({ page, pageSize: PAGE_SIZE });
    hasMoreRef.current = response.data.hasNextPage;
    pageRef.current = page;
    return response.data.items;
  }, []);

  const reload = useCallback(async () => {
    try {
      setFailed(false);
      setItems(await loadPage(1));
    } catch {
      setFailed(true);
    }
  }, [loadPage]);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || !hasMoreRef.current) {
      return;
    }
    setLoadingMore(true);
    try {
      const next = await loadPage(pageRef.current + 1);
      setItems((current) => [...current, ...next.filter((item) => !current.some((existing) => existing.id === item.id))]);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [loadPage, loadingMore]);

  const renderItem = useCallback(
    ({ item }: { item: Call }) => {
      if (!userId) {
        return null;
      }
      const other = otherParticipant(item, userId);
      const presentation = describeHistoryStatus(item, userId);
      const context = contextOf(item);
      const outgoing = isOutgoing(item, userId);
      const meta = [formatCallTimestamp(item.startedAt), item.durationSeconds > 0 ? formatDuration(item.durationSeconds) : null]
        .filter(Boolean)
        .join(' · ');

      return (
        <View style={styles.row}>
          <Avatar name={other.name} imageUrl={resolvePhotoUrl(other.photoUrl, ASSETS_BASE_URL)} size={48} />
          <View style={styles.rowBody}>
            <Text style={styles.name} numberOfLines={1}>
              {other.name}
            </Text>
            <View style={styles.statusLine}>
              <Icon name={item.callType === 'VIDEO' ? 'videocam' : 'call'} size={13} color={TONE_COLORS[presentation.tone]} />
              <Text style={[styles.statusText, { color: TONE_COLORS[presentation.tone] }]}>{presentation.label}</Text>
              <Icon name={outgoing ? 'arrow-up' : 'arrow-down'} size={12} color={colors.textTertiary} />
            </View>
            <Text style={styles.meta} numberOfLines={1}>
              {meta}
            </Text>
          </View>
          {context ? <CallButtons context={context} variant="inline" /> : null}
        </View>
      );
    },
    [userId],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={items.length === 0 ? styles.emptyContent : styles.content}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListEmptyComponent={
        failed ? (
          <EmptyState title="Could not load your calls" description="Pull down to try again." />
        ) : (
          <EmptyState title="No calls yet" description="Voice and video calls you make or receive will appear here." />
        )
      }
      ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : undefined}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.text,
  },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textTertiary,
  },
});

export default CallHistoryScreen;
