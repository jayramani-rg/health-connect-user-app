import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { FilterChips, type FilterOption } from '../../../components/FilterChips/FilterChips';
import { useTabBarInset } from '../../../components/FloatingTabBar/useTabBarInset';
import { SkeletonBlock } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors, layout } from '../../../theme';
import { appointmentService } from '../../../services/appointmentService';
import type { RootStackParamList } from '../../../navigation/types';
import { AppointmentCard } from '../components/AppointmentCard/AppointmentCard';
import type { AppointmentListItem, AppointmentTab } from '../types/appointment.types';
import { STATUS_BY_TAB } from '../types/appointment.types';
import { styles } from '../styles/MyAppointmentsScreen.styles';

const TABS: { label: string; value: AppointmentTab; counted: boolean }[] = [
  { label: 'Upcoming', value: 'upcoming', counted: true },
  { label: 'Pending', value: 'pending', counted: true },
  { label: 'Past', value: 'past', counted: false },
  { label: 'Cancelled', value: 'cancelled', counted: false },
];

const EMPTY_COPY: Record<AppointmentTab, { title: string; description: string }> = {
  upcoming: { title: 'No upcoming appointments', description: 'Confirmed visits will show up here.' },
  pending: { title: 'Nothing pending', description: 'Requests waiting for the doctor or for payment appear here.' },
  past: { title: 'No past appointments', description: 'Completed visits will be listed here.' },
  cancelled: { title: 'Nothing cancelled', description: 'Cancelled, declined or expired appointments appear here.' },
};

const MyAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const bottomInset = useTabBarInset();
  const [tab, setTab] = useState<AppointmentTab>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await appointmentService.list({ pageSize: 100 });
      setAppointments(response.data.items);
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
    const statuses = STATUS_BY_TAB[tab];
    const upcomingFirst = tab === 'upcoming' || tab === 'pending';
    return appointments
      .filter((a) => statuses.includes(a.status))
      .sort((a, b) => {
        const diff = new Date(a.scheduledStartAtUtc).getTime() - new Date(b.scheduledStartAtUtc).getTime();
        return upcomingFirst ? diff : -diff;
      });
  }, [appointments, tab]);

  const options: FilterOption<AppointmentTab>[] = TABS.map((option) => ({
    label: option.label,
    value: option.value,
    count: complete && option.counted ? appointments.filter((a) => STATUS_BY_TAB[option.value].includes(a.status)).length : undefined,
  }));

  const empty = EMPTY_COPY[tab];

  return (
    <View style={styles.container}>
      <FilterChips options={options} value={tab} onChange={setTab} accessibilityLabel="Appointment status" />

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
          renderItem={({ item }) => (
            <AppointmentCard appointment={item} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })} />
          )}
          ListEmptyComponent={
            error ? (
              <EmptyState title="Couldn't load appointments" description="Check your connection and try again." actionLabel="Try again" onActionPress={() => load()} />
            ) : (
              <EmptyState
                title={empty.title}
                description={empty.description}
                actionLabel={tab === 'upcoming' ? 'Find a doctor' : undefined}
                onActionPress={tab === 'upcoming' ? () => navigation.navigate('DoctorCategories') : undefined}
              />
            )
          }
        />
      )}
    </View>
  );
};

export default MyAppointmentsScreen;
