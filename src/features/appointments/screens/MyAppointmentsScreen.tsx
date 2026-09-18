import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { colors } from '../../../theme';
import { appointmentService } from '../../../services/appointmentService';
import type { RootStackParamList } from '../../../navigation/types';
import { AppointmentCard } from '../components/AppointmentCard/AppointmentCard';
import type { AppointmentListItem, AppointmentTab } from '../types/appointment.types';
import { STATUS_BY_TAB } from '../types/appointment.types';
import { styles } from '../styles/MyAppointmentsScreen.styles';

const TAB_OPTIONS: { label: string; value: AppointmentTab }[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Pending', value: 'pending' },
  { label: 'Past', value: 'past' },
  { label: 'Cancelled', value: 'cancelled' },
];

const EMPTY_COPY: Record<AppointmentTab, string> = {
  upcoming: 'No upcoming appointments yet.',
  pending: 'No pending requests.',
  past: 'No past appointments.',
  cancelled: 'No cancelled or declined appointments.',
};

const MyAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<AppointmentTab>('upcoming');
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const response = await appointmentService.list({ pageSize: 100 });
      setAppointments(response.data.items);
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
    const statuses = STATUS_BY_TAB[tab];
    return appointments
      .filter((a) => statuses.includes(a.status))
      .sort((a, b) => new Date(b.scheduledStartAtUtc).getTime() - new Date(a.scheduledStartAtUtc).getTime());
  }, [appointments, tab]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ChipGroup options={TAB_OPTIONS} value={tab} onChange={(v) => setTab(v as AppointmentTab)} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
          renderItem={({ item }) => (
            <AppointmentCard appointment={item} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })} />
          )}
          ListEmptyComponent={<EmptyState title={EMPTY_COPY[tab]} />}
        />
      )}
    </View>
  );
};

export default MyAppointmentsScreen;
