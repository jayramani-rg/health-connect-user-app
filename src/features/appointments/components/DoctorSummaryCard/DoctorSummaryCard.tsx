import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '../../../../components/Avatar/Avatar';
import { Icon, type IoniconsIconName } from '../../../../components/Icon/Icon';
import { colors } from '../../../../theme';
import type { ConsultationType } from '../../types/appointment.types';
import { CONSULT_LABEL } from '../../utils/consultationType';
import { styles } from './styles/DoctorSummaryCard.styles';

export const MODE_ICON: Record<ConsultationType, IoniconsIconName> = {
  IN_CLINIC: 'business-outline',
  VIDEO: 'videocam-outline',
  VOICE: 'call-outline',
};

export interface DoctorSummaryCardProps {
  name: string;
  specialization: string;
  experienceYears: number;
  photoUrl: string | null;
  consultationType: ConsultationType | null;
  fee: number | null;
  durationMinutes: number | null;
  location?: string | null;
  onChangeType?: () => void;
}

export function formatFee(fee: number | null): string {
  return fee == null ? 'Fee on request' : `₹${fee.toLocaleString('en-IN')}`;
}

export function DoctorSummaryCard({ name, specialization, experienceYears, photoUrl, consultationType, fee, durationMinutes, location, onChangeType }: DoctorSummaryCardProps) {
  const subtitle = [specialization, experienceYears > 0 ? `${experienceYears} yrs exp` : null].filter(Boolean).join(' · ');

  return (
    <View style={styles.card}>
      <View style={styles.identity}>
        <Avatar name={name} imageUrl={photoUrl} size={52} />
        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          {location ? (
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
          ) : null}
        </View>
      </View>

      {consultationType ? (
        <View style={styles.modeRow}>
          <View style={styles.modeInfo}>
            <View style={styles.modeIcon}>
              <Icon name={MODE_ICON[consultationType]} size={16} color={colors.brand} />
            </View>
            <Text style={styles.modeLabel} numberOfLines={1}>
              {CONSULT_LABEL[consultationType]}
              {durationMinutes ? <Text style={styles.modeMeta}>{`  ·  ${durationMinutes} min`}</Text> : null}
            </Text>
          </View>
          <View style={styles.modeRight}>
            <Text style={styles.fee}>{formatFee(fee)}</Text>
            {onChangeType ? (
              <Pressable onPress={onChangeType} hitSlop={10} accessibilityRole="button" accessibilityLabel="Change consultation type">
                <Text style={styles.change}>Change</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}
