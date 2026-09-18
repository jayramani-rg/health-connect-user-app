import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ResultScreen } from '../../../components/ResultScreen/ResultScreen';
import { colors } from '../../../theme';
import { appointmentService } from '../../../services/appointmentService';
import type { RootStackParamList } from '../../../navigation/types';
import type { AppointmentDetail } from '../types/appointment.types';
import { CONSULT_LABEL } from '../utils/consultationType';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentConfirmation'>;

const AppointmentConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { appointmentId } = route.params;
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await appointmentService.getById(appointmentId);
        if (active) setAppointment(response.data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [appointmentId]);

  if (loading || !appointment) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brand} />
      </View>
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
