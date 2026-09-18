import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
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
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>{doctor.fullName.trim().charAt(0).toUpperCase() || '?'}</Text>
      </View>
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
          <Text style={styles.fee}>₹{doctor.consultationFee}</Text>
          {!doctor.isAcceptingAppointments && <Text style={styles.pausedText}>Not accepting requests</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export type { DoctorCardProps };
