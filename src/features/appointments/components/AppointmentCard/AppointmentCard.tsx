import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StatusBadge } from '../../../../components/StatusBadge/StatusBadge';
import { activeopacity } from '../../../../utils/helpers';
import { CONSULT_LABEL } from '../../utils/consultationType';
import { styles } from './styles/AppointmentCard.styles';
import type { AppointmentCardProps } from './types/AppointmentCard.types';

export function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const scheduled = new Date(appointment.scheduledStartAtUtc);

  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {appointment.doctorName}
          </Text>
          {appointment.doctorSpecialization ? <Text style={styles.specialization}>{appointment.doctorSpecialization}</Text> : null}
        </View>
        <StatusBadge status={appointment.status} />
      </View>
      <View style={styles.divider} />
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{CONSULT_LABEL[appointment.consultationType]}</Text>
        <Text style={styles.detailValue}>
          {scheduled.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} ·{' '}
          {scheduled.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export type { AppointmentCardProps };
