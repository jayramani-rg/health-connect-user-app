import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '../../../../components/Avatar/Avatar';
import { Icon, type IoniconsIconName } from '../../../../components/Icon/Icon';
import { StatusBadge } from '../../../../components/StatusBadge/StatusBadge';
import { colors } from '../../../../theme';
import { formatWhen } from '../../../../utils/dateFormat';
import { CONSULT_LABEL } from '../../utils/consultationType';
import type { ConsultationType } from '../../types/appointment.types';
import { styles } from './styles/AppointmentCard.styles';
import type { AppointmentCardProps } from './types/AppointmentCard.types';

const CONSULT_ICON: Record<ConsultationType, IoniconsIconName> = {
  IN_CLINIC: 'business-outline',
  VIDEO: 'videocam-outline',
  VOICE: 'call-outline',
};

export function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const when = formatWhen(appointment.scheduledStartAtUtc);
  const mode = CONSULT_LABEL[appointment.consultationType];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[appointment.doctorName, appointment.doctorSpecialization, when, mode].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.topRow}>
        <Avatar name={appointment.doctorName} size={44} />
        <View style={styles.identity}>
          <Text style={styles.title} numberOfLines={1}>
            {appointment.doctorName}
          </Text>
          {appointment.doctorSpecialization ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {appointment.doctorSpecialization}
            </Text>
          ) : null}
        </View>
        <StatusBadge status={appointment.status} />
      </View>
      <View style={styles.facts}>
        <View style={styles.fact}>
          <Icon name="calendar-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.factText} numberOfLines={1}>
            {when}
          </Text>
        </View>
        <View style={styles.fact}>
          <Icon name={CONSULT_ICON[appointment.consultationType]} size={15} color={colors.textSecondary} />
          <Text style={styles.factText} numberOfLines={1}>
            {mode}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export type { AppointmentCardProps };
