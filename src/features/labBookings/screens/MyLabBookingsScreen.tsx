import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { FilterChips, type FilterOption } from '../../../components/FilterChips/FilterChips';
import { useTabBarInset } from '../../../components/FloatingTabBar/useTabBarInset';
import { SkeletonBlock } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors, layout } from '../../../theme';
import { labBookingService } from '../../../services/labBookingService';
import type { RootStackParamList } from '../../../navigation/types';
import { LabBookingCard } from '../components/LabBookingCard/LabBookingCard';
import type { LabBookingListItem, LabBookingTab } from '../types/labBooking.types';
import { LAB_STATUS_BY_TAB } from '../types/labBooking.types';
import { styles } from '../../appointments/styles/MyAppointmentsScreen.styles';

const TABS: { label: string; value: LabBookingTab; counted: boolean }[] = [
  { label: 'Upcoming', value: 'upcoming', counted: true },
  { label: 'Pending', value: 'pending', counted: true },
  { label: 'Processing', value: 'processing', counted: true },
  { label: 'Reports', value: 'reports', counted: false },
  { label: 'Cancelled', value: 'cancelled', counted: false },
];

const EMPTY_COPY: Record<LabBookingTab, { title: string; description: string }> = {
  upcoming: { title: 'No upcoming lab tests', description: 'Confirmed lab visits and home collections show up here.' },
  pending: { title: 'Nothing pending', description: 'Bookings waiting for the lab or for payment appear here.' },
  processing: { title: 'No samples in processing', description: 'Collected samples being tested appear here.' },
  reports: { title: 'No reports yet', description: 'Reports appear here as soon as the lab uploads them.' },
  cancelled: { title: 'Nothing cancelled', description: 'Cancelled, declined or failed bookings appear here.' },
};

const MyLabBookingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bottomInset = useTabBarInset();
  const [tab, setTab] = useState<LabBookingTab>('upcoming');
  const [bookings, setBookings] = useState<LabBookingListItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await labBookingService.list({ pageSize: 100 });
      setBookings(response.data.items);
      setComplete(response.data.totalCount <= response.data.items.length);
      setError(false);
    } catch {
      setError(true);
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const statuses = LAB_STATUS_BY_TAB[tab];
    const upcomingFirst = tab === 'upcoming' || tab === 'pending';
    return bookings
      .filter((b) => statuses.includes(b.status))
      .sort((a, b) => {
        const diff = new Date(a.scheduledAtUtc).getTime() - new Date(b.scheduledAtUtc).getTime();
        return upcomingFirst ? diff : -diff;
      });
  }, [bookings, tab]);

  const options: FilterOption<LabBookingTab>[] = TABS.map((option) => ({
    label: option.label,
    value: option.value,
    count: complete && option.counted ? bookings.filter((b) => LAB_STATUS_BY_TAB[option.value].includes(b.status)).length : undefined,
  }));

  const empty = EMPTY_COPY[tab];

  return (
    <View style={styles.container}>
      <FilterChips options={options} value={tab} onChange={setTab} accessibilityLabel="Lab booking status" />

      {loading ? (
        <View style={[styles.listContent, styles.skeleton]}>
          {[0, 1, 2].map((key) => (
            <SkeletonBlock key={key} width="100%" height={116} radius={layout.cardRadius} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.brand} colors={[colors.brand]} />}
          renderItem={({ item }) => <LabBookingCard booking={item} onPress={() => navigation.navigate('LabBookingDetail', { bookingId: item.id })} />}
          ListEmptyComponent={
            error ? (
              <EmptyState title="Couldn't load lab bookings" description="Check your connection and try again." actionLabel="Try again" onActionPress={() => load()} />
            ) : (
              <EmptyState
                title={empty.title}
                description={empty.description}
                actionLabel={tab === 'upcoming' ? 'Book a lab test' : undefined}
                onActionPress={tab === 'upcoming' ? () => navigation.navigate('LabCategories') : undefined}
              />
            )
          }
        />
      )}
    </View>
  );
};

export default MyLabBookingsScreen;
