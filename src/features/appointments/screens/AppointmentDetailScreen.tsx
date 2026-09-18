import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import { colors } from '../../../theme';
import { appointmentService } from '../../../services/appointmentService';
import type { RootStackParamList } from '../../../navigation/types';
import type { AppointmentDetail } from '../types/appointment.types';
import { CONSULT_LABEL } from '../utils/consultationType';
import { styles } from '../styles/AppointmentDetailScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentDetail'>;

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

const AppointmentDetailScreen: React.FC<Props> = ({ route }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await appointmentService.getById(appointmentId);
      setAppointment(response.data);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not load this appointment.');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function confirmCancel() {
    Alert.alert('Cancel appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, cancel', style: 'destructive', onPress: () => runAction(() => appointmentService.cancel(appointmentId)) },
    ]);
  }

  async function runAction(action: () => Promise<{ data: AppointmentDetail }>) {
    setActionLoading(true);
    setActionError(null);
    try {
      const response = await action();
      setAppointment(response.data);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'This action could not be completed.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!appointment) {
    return (
      <ScreenContainer>
        <Banner variant="error" message={actionError ?? 'Appointment not found.'} />
      </ScreenContainer>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED', 'RESCHEDULE_PROPOSED'].includes(appointment.status);
  const isRescheduleProposed = appointment.status === 'RESCHEDULE_PROPOSED';

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctorName}>{appointment.doctorName}</Text>
          {appointment.doctorSpecialization ? <Text style={styles.specialization}>{appointment.doctorSpecialization}</Text> : null}
        </View>
        <StatusBadge status={appointment.status} />
      </View>

      {actionError && <Banner variant="error" message={actionError} />}

      {appointment.consultationType !== 'IN_CLINIC' && appointment.status === 'CONFIRMED' && (
        <Banner variant="info" message="You'll be notified here when it's time to join this consultation." />
      )}
      {appointment.status === 'IN_PROGRESS' && <Banner variant="success" message="Your consultation is currently in progress." />}

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Consultation</Text>
          <Text style={styles.value}>{CONSULT_LABEL[appointment.consultationType]}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Scheduled for</Text>
          <Text style={styles.value}>{formatDateTime(appointment.scheduledStartAtUtc)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{appointment.durationMinutes} min</Text>
        </View>
        {appointment.clinicAddress && (
          <View style={styles.row}>
            <Text style={styles.label}>Clinic</Text>
            <Text style={styles.value}>{appointment.clinicAddress}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Fee</Text>
          <Text style={styles.value}>₹{appointment.consultationFee}</Text>
        </View>
      </View>

      {appointment.reason && (
        <>
          <Text style={styles.sectionTitle}>Reason</Text>
          <Text style={styles.reasonText}>{appointment.reason}</Text>
        </>
      )}

      {isRescheduleProposed && appointment.rescheduleProposedStartAtUtc && (
        <>
          <Text style={styles.sectionTitle}>New time proposed</Text>
          <Banner
            variant="warning"
            message={`${appointment.doctorName} proposed ${formatDateTime(appointment.rescheduleProposedStartAtUtc)}${
              appointment.rescheduleNote ? ` — "${appointment.rescheduleNote}"` : ''
            }`}
          />
          <View style={[styles.rescheduleRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Button
                label="Decline"
                variant="secondary"
                disabled={actionLoading}
                onPress={() => runAction(() => appointmentService.respondToReschedule(appointmentId, false))}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Accept new time"
                loading={actionLoading}
                onPress={() => runAction(() => appointmentService.respondToReschedule(appointmentId, true))}
              />
            </View>
          </View>
        </>
      )}

      {appointment.cancellationReason && (
        <>
          <Text style={styles.sectionTitle}>Cancellation reason</Text>
          <Text style={styles.reasonText}>{appointment.cancellationReason}</Text>
        </>
      )}
      {appointment.rejectionReason && (
        <>
          <Text style={styles.sectionTitle}>Reason declined</Text>
          <Text style={styles.reasonText}>{appointment.rejectionReason}</Text>
        </>
      )}

      {appointment.history.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {appointment.history.map((entry, index) => (
            <View key={index} style={styles.historyRow}>
              <View style={styles.historyDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyAction}>{entry.note || entry.action.replace(/_/g, ' ')}</Text>
                <Text style={styles.historyMeta}>{formatDateTime(entry.createdAt)}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {canCancel && !isRescheduleProposed && (
        <View style={styles.actions}>
          <Button label="Cancel appointment" variant="secondary" disabled={actionLoading} onPress={confirmCancel} />
        </View>
      )}
    </ScreenContainer>
  );
};

export default AppointmentDetailScreen;
