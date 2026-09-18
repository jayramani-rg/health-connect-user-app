import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { LabStatusBadge } from '../../../components/LabStatusBadge/LabStatusBadge';
import { activeopacity } from '../../../utils/helpers';
import { colors, radius, spacing, typography } from '../../../theme';
import { labBookingService } from '../../../services/labBookingService';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabBookingListItem, LabBookingTab } from '../types/labBooking.types';
import { LAB_STATUS_BY_TAB } from '../types/labBooking.types';

const TAB_OPTIONS: { label: string; value: LabBookingTab }[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Reports', value: 'reports' },
  { label: 'Cancelled', value: 'cancelled' },
];

const EMPTY_COPY: Record<LabBookingTab, string> = {
  upcoming: 'No upcoming lab bookings.',
  pending: 'No pending requests.',
  processing: 'No samples in processing.',
  reports: 'No reports ready yet.',
  cancelled: 'No cancelled, declined, or failed bookings.',
};

const MyLabBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<LabBookingTab>('upcoming');
  const [bookings, setBookings] = useState<LabBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await labBookingService.list({ pageSize: 100 });
      setBookings(response.data.items);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const filtered = useMemo(() => {
    const statuses = LAB_STATUS_BY_TAB[tab];
    return bookings
      .filter((b) => statuses.includes(b.status))
      .sort((a, b) => new Date(b.scheduledAtUtc).getTime() - new Date(a.scheduledAtUtc).getTime());
  }, [bookings, tab]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={styles.header}>
        <ChipGroup options={TAB_OPTIONS} value={tab} onChange={(v) => setTab(v as LabBookingTab)} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => {
            const scheduled = new Date(item.scheduledAtUtc);
            return (
              <TouchableOpacity
                activeOpacity={activeopacity}
                style={styles.card}
                onPress={() => navigation.navigate('LabBookingDetail', { bookingId: item.id })}
              >
                <View style={styles.topRow}>
                  <Text style={typography.bodyStrong} numberOfLines={1}>
                    {item.laboratoryName}
                  </Text>
                  <LabStatusBadge status={item.status} />
                </View>
                <Text style={styles.services} numberOfLines={1}>
                  {item.serviceNames.join(', ')}
                </Text>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{item.collectionMethod === 'LAB_VISIT' ? 'Lab visit' : 'Home collection'}</Text>
                  <Text style={styles.detailValue}>
                    {scheduled.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} ·{' '}
                    {scheduled.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<EmptyState title={EMPTY_COPY[tab]} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  services: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyStrong,
    color: colors.text,
  },
});

export default MyLabBookingsScreen;
