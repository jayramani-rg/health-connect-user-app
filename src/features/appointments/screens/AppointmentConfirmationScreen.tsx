import React, { useCallback, useEffect, useState } from 'react';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ResultScreen } from '../../../components/ResultScreen/ResultScreen';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import { appointmentService } from '../../../services/appointmentService';
import type { RootStackParamList } from '../../../navigation/types';
import type { AppointmentDetail } from '../types/appointment.types';
import { CONSULT_LABEL } from '../utils/consultationType';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentConfirmation'>;

const AppointmentConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await appointmentService.getById(appointmentId);
      setAppointment(response.data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not load your appointment.');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenContainer>
        <SkeletonList count={2} />
      </ScreenContainer>
    );
  }

  if (!appointment) {
    return (
      <ScreenContainer>
        <EmptyState title="Something went wrong" description={errorText ?? 'Could not load your appointment.'} actionLabel="Try again" onActionPress={load} />
      </ScreenContainer>
    );
  }

  const scheduled = new Date(appointment.scheduledStartAtUtc);
  const isConfirmed = appointment.status === 'CONFIRMED';

  return (
    <ResultScreen
      tone={isConfirmed ? 'success' : 'pending'}
      title={isConfirmed ? 'Appointment confirmed' : 'Request sent'}
      description={
        isConfirmed
          ? `${appointment.doctorName} confirmed your ${CONSULT_LABEL[appointment.consultationType].toLowerCase()} on ${scheduled.toLocaleDateString(
              undefined,
              { day: 'numeric', month: 'short' },
            )} at ${scheduled.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}.`
          : `Your request has been sent to ${appointment.doctorName}. You'll be notified once they respond.`
      }
      primaryLabel="Track this request"
      onPrimaryPress={() => navigation.replace('AppointmentDetail', { appointmentId })}
      secondaryLabel="Back to home"
      onSecondaryPress={() => navigation.navigate('MainTabs')}
    />
  );
};

export default AppointmentConfirmationScreen;
