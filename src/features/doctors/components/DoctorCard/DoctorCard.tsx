import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '../../../../components/Avatar/Avatar';
import { activeopacity } from '../../../../utils/helpers';
import { styles } from './styles/DoctorCard.styles';
import type { DoctorCardProps } from './types/DoctorCard.types';

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const modes = [
    doctor.inClinicEnabled && 'In-clinic',
    doctor.videoEnabled && 'Video',
    doctor.voiceEnabled && 'Voice',
  ].filter(Boolean) as string[];

  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.card} onPress={onPress}>
      <Avatar name={doctor.fullName} imageUrl={doctor.profilePhotoUrl} size={56} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {doctor.fullName}
        </Text>
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
          {!doctor.isAcceptingAppointments && <Text style={styles.pausedText}>Not accepting requests</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export type { DoctorCardProps };
