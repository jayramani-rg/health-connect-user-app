// features/home/screens/HomeScreen.tsx
// Real appointment dashboard: next upcoming appointment, pending-request count, and quick actions —
// replaces the earlier mock-first e-commerce placeholder (Sec 17.2) now that the appointment API exists.

import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import { useAppSelector } from '../../../store';
import { activeopacity } from '../../../utils/helpers';
import { appointmentService } from '../../../services/appointmentService';
import type { RootStackParamList } from '../../../navigation/types';
import { CONSULT_LABEL } from '../../appointments/utils/consultationType';
import type { AppointmentListItem } from '../../appointments/types/appointment.types';
import { styles } from '../styles/HomeScreen.styles';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isConnected = useAppSelector((state) => state.networkData.isConnected);

  const [upcoming, setUpcoming] = useState<AppointmentListItem | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const [confirmedRes, pendingRes] = await Promise.all([
        appointmentService.list({ status: 'CONFIRMED', pageSize: 1 }),
        appointmentService.list({ status: 'PENDING', pageSize: 1 }),
      ]);
      setUpcoming(confirmedRes.data.items[0] ?? null);
      setPendingCount(pendingRes.data.totalCount);
    } catch {
      // Dashboard is best-effort — MyAppointmentsScreen surfaces real errors on demand.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.subGreeting}>Here's what's next for your care.</Text>

        {pendingCount > 0 && (
          <Banner variant="info" message={`You have ${pendingCount} appointment request${pendingCount > 1 ? 's' : ''} awaiting a response.`} />
        )}

        <TouchableOpacity activeOpacity={activeopacity} style={styles.primaryCard} onPress={() => navigation.navigate('DoctorList')}>
          <Text style={styles.primaryCardTitle}>Find a doctor</Text>
          <Text style={styles.primaryCardSubtitle}>Search by specialization or consultation type.</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={activeopacity} style={styles.primaryCard} onPress={() => navigation.navigate('LabList')}>
          <Text style={styles.primaryCardTitle}>Book a lab test</Text>
          <Text style={styles.primaryCardSubtitle}>Visit the lab or get sample collection at home.</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming appointment</Text>
          <TouchableOpacity activeOpacity={activeopacity} onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.linkText}>View all</Text>
          </TouchableOpacity>
        </View>

        {upcoming ? (
          <TouchableOpacity
            activeOpacity={activeopacity}
            style={styles.card}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: upcoming.id })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.cardTitle}>{upcoming.doctorName}</Text>
              <StatusBadge status={upcoming.status} />
            </View>
            <Text style={styles.cardSubtitle}>
              {CONSULT_LABEL[upcoming.consultationType]} ·{' '}
              {new Date(upcoming.scheduledStartAtUtc).toLocaleString(undefined, {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyCard}>No upcoming appointments yet.</Text>
          </View>
        )}
      </ScrollView>
      {!isConnected && <Text style={styles.offlineBanner}>You are offline</Text>}
    </View>
  );
};

export default HomeScreen;
