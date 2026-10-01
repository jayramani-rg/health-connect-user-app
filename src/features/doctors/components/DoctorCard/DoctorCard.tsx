import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '../../../../components/Avatar/Avatar';
import { Icon } from '../../../../components/Icon/Icon';
import { colors } from '../../../../theme';
import { activeopacity } from '../../../../utils/helpers';
import { styles } from './styles/DoctorCard.styles';
import type { DoctorCardProps } from './types/DoctorCard.types';

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const modes = [
    doctor.inClinicEnabled && 'In-clinic',
    doctor.videoEnabled && 'Video',
    doctor.voiceEnabled && 'Voice',
  ].filter(Boolean) as string[];

  const area = [doctor.clinicLocality, doctor.clinicCity].filter(Boolean).join(', ');
  const nearLabel = doctor.localityMatch === 'SAME_LOCALITY' ? 'Near you' : doctor.localityMatch === 'SAME_CITY' ? 'In your city' : null;

  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.card} onPress={onPress}>
      <Avatar name={doctor.fullName} imageUrl={doctor.profilePhotoUrl} size={56} />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, styles.nameFlex]} numberOfLines={1}>
            {doctor.fullName}
          </Text>
          {nearLabel && (
            <View style={[styles.nearBadge, doctor.localityMatch === 'SAME_CITY' && styles.nearBadgeCity]}>
              <Icon name="navigate" size={10} color={doctor.localityMatch === 'SAME_LOCALITY' ? colors.white : colors.primary} />
              <Text style={[styles.nearBadgeText, doctor.localityMatch === 'SAME_CITY' && styles.nearBadgeTextCity]}>{nearLabel}</Text>
            </View>
          )}
        </View>
        <Text style={styles.specialization} numberOfLines={1}>
          {doctor.specialization}
          {doctor.experienceYears > 0 ? ` · ${doctor.experienceYears} yrs exp` : ''}
        </Text>
        <View style={styles.metaRow}>
          {modes.map((mode) => (
            <Text key={mode} style={styles.metaChip}>
              {mode}
            </Text>
          ))}
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.fee}>{doctor.minConsultationFee != null ? `From ₹${doctor.minConsultationFee}` : 'Fee not available'}</Text>
          {!doctor.isAcceptingAppointments ? (
            <Text style={styles.pausedText}>Not accepting requests</Text>
          ) : area ? (
            <View style={styles.areaRow}>
              <Icon name="location-outline" size={12} color={colors.inkFaint} />
              <Text style={styles.areaText} numberOfLines={1}>
                {area}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export type { DoctorCardProps };
