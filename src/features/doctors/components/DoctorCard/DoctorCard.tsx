import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Icon } from '../../../../components/Icon/Icon';
import type { IoniconsIconName } from '../../../../components/Icon/Icon';
import { colors } from '../../../../theme';
import { formatFee, formatNextAvailable, joinArea } from '../../../../utils/providerFormat';
import type { ConsultationType } from '../../types/doctor.types';
import { styles } from './styles/DoctorCard.styles';
import type { DoctorCardProps } from './types/DoctorCard.types';

const MODE_META: Record<ConsultationType, { label: string; icon: IoniconsIconName }> = {
  IN_CLINIC: { label: 'In-clinic', icon: 'business-outline' },
  VIDEO: { label: 'Video', icon: 'videocam-outline' },
  VOICE: { label: 'Voice', icon: 'call-outline' },
};

type AvailabilityTone = 'open' | 'muted' | 'warning';

function DoctorPhoto({ name, uri }: { name: string; uri: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <View style={styles.photo}>
      {uri && !failed ? (
        <Image source={{ uri }} style={styles.photoImage} resizeMode="cover" onError={() => setFailed(true)} accessibilityIgnoresInvertColors />
      ) : (
        <Text style={styles.photoInitial}>{name.trim().charAt(0).toUpperCase() || '?'}</Text>
      )}
    </View>
  );
}

export function DoctorCard({ doctor, onPress, onBook, showNextMode = true }: DoctorCardProps) {
  const modes = (['IN_CLINIC', 'VIDEO', 'VOICE'] as ConsultationType[]).filter(
    (mode) => (mode === 'IN_CLINIC' && doctor.inClinicEnabled) || (mode === 'VIDEO' && doctor.videoEnabled) || (mode === 'VOICE' && doctor.voiceEnabled),
  );
  const specialty = [doctor.specialization, doctor.subSpecialization].filter(Boolean).join(' · ');
  const area = joinArea(doctor.clinicLocality, doctor.clinicCity);
  const nearLabel = doctor.localityMatch === 'SAME_LOCALITY' ? 'Near you' : doctor.localityMatch === 'SAME_CITY' ? 'In your city' : null;
  const accepting = doctor.isAcceptingAppointments;
  const hasNextField = doctor.nextAvailableAtUtc !== undefined;

  let availabilityText: string | null = null;
  let tone: AvailabilityTone = 'open';
  if (!accepting) {
    availabilityText = 'Not taking new appointments';
    tone = 'muted';
  } else if (doctor.nextAvailableAtUtc) {
    const modeSuffix =
      showNextMode && modes.length > 1 && doctor.nextAvailableConsultationType ? ` · ${MODE_META[doctor.nextAvailableConsultationType].label}` : '';
    availabilityText = `Next available ${formatNextAvailable(doctor.nextAvailableAtUtc)}${modeSuffix}`;
  } else if (hasNextField) {
    availabilityText = 'No openings in the next 7 days';
    tone = 'warning';
  }

  const fee = doctor.minConsultationFee;
  const feeText = fee == null ? null : `${modes.length > 1 ? 'From ' : ''}${formatFee(fee)}`;
  const canBook = accepting && !!onBook && modes.length > 0;

  const accessibilityLabel = [
    doctor.fullName,
    'verified',
    specialty,
    doctor.experienceYears > 0 ? `${doctor.experienceYears} years of experience` : null,
    area || null,
    availabilityText,
    feeText ? `Consultation fee ${feeText}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens the doctor's profile"
    >
      <View style={styles.top}>
        <DoctorPhoto name={doctor.fullName} uri={doctor.profilePhotoUrl} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {doctor.fullName}
            </Text>
            <Icon name="shield-checkmark" size={16} color={colors.brand} />
          </View>
          <Text style={styles.specialty} numberOfLines={1}>
            {specialty}
          </Text>
          <View style={styles.metaRow}>
            {doctor.experienceYears > 0 ? (
              <>
                <Text style={styles.metaStrong}>{doctor.experienceYears} yrs exp</Text>
                {nearLabel || area ? <View style={styles.metaDot} /> : null}
              </>
            ) : null}
            {nearLabel ? (
              <Text style={styles.nearText} numberOfLines={1}>
                {nearLabel}
              </Text>
            ) : area ? (
              <>
                <Icon name="location-outline" size={13} color={colors.textTertiary} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {area}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </View>

      {availabilityText ? (
        <View style={[styles.availability, tone === 'muted' && styles.availabilityMuted, tone === 'warning' && styles.availabilityWarning]}>
          <View style={[styles.availabilityDot, tone === 'muted' && styles.availabilityDotMuted, tone === 'warning' && styles.availabilityDotWarning]} />
          <Text
            style={[styles.availabilityText, tone === 'muted' && styles.availabilityTextMuted, tone === 'warning' && styles.availabilityTextWarning]}
            numberOfLines={1}
          >
            {availabilityText}
          </Text>
        </View>
      ) : null}

      {modes.length > 0 ? (
        <View style={styles.modes}>
          {modes.map((mode) => (
            <View key={mode} style={styles.mode}>
              <Icon name={MODE_META[mode].icon} size={15} color={colors.textSecondary} />
              <Text style={styles.modeText}>{MODE_META[mode].label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.footer}>
        <View>
          <Text style={styles.feeLabel}>Consultation fee</Text>
          {feeText ? <Text style={styles.feeValue}>{feeText}</Text> : <Text style={styles.feeMuted}>Not listed</Text>}
        </View>
        {canBook ? (
          <Pressable
            onPress={onBook}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`Book an appointment with ${doctor.fullName}`}
          >
            <Text style={styles.actionText}>Book</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.action, styles.actionSecondary, pressed && styles.actionSecondaryPressed]}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`View ${doctor.fullName}'s profile`}
          >
            <Text style={[styles.actionText, styles.actionTextSecondary]}>View profile</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

export type { DoctorCardProps };
