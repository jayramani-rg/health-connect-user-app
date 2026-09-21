import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { Icon, type IoniconsIconName } from '../../../components/Icon/Icon';
import { colors, radius, spacing, typography } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { notificationService } from '../../../services/notificationService';
import { chatSocket } from '../../../services/chatSocket';
import { useAppDispatch, setUnreadCount } from '../../../store';
import type { RootStackParamList } from '../../../navigation/types';
import type { AppNotification, NotificationType } from '../types/notification.types';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationCenter'>;

const CATEGORY_ICON: Record<string, IoniconsIconName> = {
  CHAT: 'chatbubble-ellipses',
  APPOINTMENT: 'calendar',
  LAB: 'flask',
  PROFILE: 'person-circle',
};

function iconFor(type: NotificationType): IoniconsIconName {
  const prefix = type.split('_')[0];
  return CATEGORY_ICON[prefix] ?? 'notifications';
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

const NotificationCenterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await notificationService.list({ pageSize: 50 });
      setNotifications(response.data.items);
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
    return chatSocket.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });
  }, []);

  async function handlePress(item: AppNotification) {
    if (!item.isRead) {
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true, readAtUtc: new Date().toISOString() } : n)));
      notificationService.markRead(item.id).catch(() => {});
      const unread = await notificationService.unreadCount().catch(() => null);
      if (unread) dispatch(setUnreadCount(unread.data.count));
    }
    navigateToTarget(item);
  }

  function navigateToTarget(item: AppNotification) {
    if (!item.entityId) return;
    if (item.entityType === 'Appointment') {
      navigation.navigate('AppointmentDetail', { appointmentId: item.entityId });
    } else if (item.entityType === 'LabBooking') {
      navigation.navigate('LabBookingDetail', { bookingId: item.entityId });
    } else if (item.entityType === 'ChatConversation') {
      navigation.navigate('ChatConversation', { conversationId: item.entityId });
    } else if (item.entityType === 'ChatInvitation') {
      navigation.navigate('MainTabs', { screen: 'Chat' });
    }
  }

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    dispatch(setUnreadCount(0));
    await notificationService.markAllRead().catch(() => {});
  }, [dispatch]);

  const hasUnread = notifications.some((n) => !n.isRead);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={{ ...typography.bodyStrong, color: colors.brand }}>Mark all read</Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, hasUnread, handleMarkAllRead]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          ListEmptyComponent={<EmptyState title="No notifications yet" description="Updates about your appointments, lab bookings, and chats will show up here." />}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={activeopacity} style={[cardStyle, !item.isRead && cardUnreadStyle]} onPress={() => handlePress(item)}>
              <View style={iconWrapStyle}>
                <Icon name={iconFor(item.type)} size={18} color={colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ ...typography.bodyStrong, flex: 1 }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={{ ...typography.caption, color: colors.textTertiary, marginLeft: spacing.sm }}>
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                </View>
                <Text style={{ ...typography.body, color: colors.textSecondary, marginTop: 2 }} numberOfLines={2}>
                  {item.body}
                </Text>
              </View>
              {!item.isRead && <View style={unreadDotStyle} />}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const cardStyle = {
  flexDirection: 'row' as const,
  alignItems: 'flex-start' as const,
  gap: spacing.sm,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.lg,
  padding: spacing.md,
  marginBottom: spacing.sm,
};

const cardUnreadStyle = {
  backgroundColor: colors.brandSoft,
  borderColor: colors.brand,
};

const iconWrapStyle = {
  width: 36,
  height: 36,
  borderRadius: radius.md,
  backgroundColor: colors.surface2,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const unreadDotStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.brand,
  marginTop: 4,
};

export default NotificationCenterScreen;
