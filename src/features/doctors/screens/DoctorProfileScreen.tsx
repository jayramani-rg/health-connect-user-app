import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors } from '../../../theme';
import { doctorService } from '../../../services/doctorService';
import type { RootStackParamList } from '../../../navigation/types';
import { CONSULT_LABEL } from '../../appointments/utils/consultationType';
import type { ConsultationType, DoctorDetail } from '../types/doctor.types';
import { styles } from '../styles/DoctorProfileScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorProfile'>;

const MODE_ORDER: ConsultationType[] = ['VIDEO', 'VOICE', 'IN_CLINIC'];

const DoctorProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { doctorProfileId } = route.params;
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await doctorService.getById(doctorProfileId);
        if (active) setDoctor(response.data);
      } catch (error) {
        if (active) setErrorText(error instanceof Error ? error.message : 'Could not load this doctor.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [doctorProfileId]);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <ScreenContainer>
        <Banner variant="error" message={errorText ?? 'Doctor not found.'} />
      </ScreenContainer>
    );
  }

  const modeFee: Record<ConsultationType, { enabled: boolean; fee: number | null; duration: number | null }> = {
    IN_CLINIC: { enabled: doctor.availability?.inClinicEnabled ?? false, fee: doctor.availability?.inClinicFee ?? null, duration: doctor.availability?.inClinicDurationMinutes ?? null },
    VIDEO: { enabled: doctor.availability?.videoEnabled ?? false, fee: doctor.availability?.videoFee ?? null, duration: doctor.availability?.videoDurationMinutes ?? null },
    VOICE: { enabled: doctor.availability?.voiceEnabled ?? false, fee: doctor.availability?.voiceFee ?? null, duration: doctor.availability?.voiceDurationMinutes ?? null },
  };

  const canBook = doctor.isAcceptingAppointments && MODE_ORDER.some((mode) => modeFee[mode].enabled);

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{doctor.fullName.trim().charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <View>
          <Text style={styles.name}>{doctor.fullName}</Text>
          <Text style={styles.specialization}>
            {doctor.specialization}
            {doctor.experienceYears > 0 ? ` · ${doctor.experienceYears} yrs exp` : ''}
          </Text>
        </View>
      </View>

      {!doctor.isAcceptingAppointments && <Banner variant="warning" message="This doctor is not accepting new appointment requests right now." />}

      {doctor.bio ? (
        <>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bodyText}>{doctor.bio}</Text>
        </>
      ) : null}

      {doctor.qualifications.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Qualifications</Text>
          {doctor.qualifications.map((q, index) => (
            <Text key={`${q.degree}-${index}`} style={styles.qualificationRow}>
              {q.degree} — {q.institution} ({q.passingYear})
            </Text>
          ))}
        </>
      )}

      <Text style={styles.sectionTitle}>Consultation options</Text>
      {MODE_ORDER.filter((mode) => modeFee[mode].enabled).map((mode) => (
        <View key={mode} style={styles.modeCard}>
          <View>
            <Text style={styles.modeName}>{CONSULT_LABEL[mode]}</Text>
            {modeFee[mode].duration ? <Text style={styles.modeDetail}>{modeFee[mode].duration} min</Text> : null}
          </View>
          <Text style={styles.modeFee}>₹{modeFee[mode].fee ?? doctor.consultationFee}</Text>
        </View>
      ))}
      {doctor.availability?.cancellationPolicy ? <Text style={styles.policyText}>{doctor.availability.cancellationPolicy}</Text> : null}

      <View style={styles.footer}>
        <Button
          label={canBook ? 'Request appointment' : 'Not accepting requests'}
          disabled={!canBook}
          onPress={() => navigation.navigate('BookAppointment', { doctorProfileId })}
        />
      </View>
    </ScreenContainer>
  );
};

export default DoctorProfileScreen;
