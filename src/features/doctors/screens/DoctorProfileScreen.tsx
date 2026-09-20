import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { doctorService } from '../../../services/doctorService';
import type { RootStackParamList } from '../../../navigation/types';
import { CONSULT_LABEL } from '../../appointments/utils/consultationType';
import type { ConsultationType, DoctorDetail } from '../types/doctor.types';
import { useChatCta } from '../../chat/hooks/useChatCta';
import { useProfileGate } from '../../profile/hooks/useProfileGate';
import { ProfileGateDialog } from '../../profile/components/ProfileGateDialog';
import { styles } from '../styles/DoctorProfileScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorProfile'>;

const MODE_ORDER: ConsultationType[] = ['VIDEO', 'VOICE', 'IN_CLINIC'];

const DoctorProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { doctorProfileId } = route.params;
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ConsultationType | null>(null);
  const chatCta = useChatCta('DOCTOR', doctorProfileId);
  const { runWithProfileGate, dialogVisible, handleCompleteProfile, handleDismissGate } = useProfileGate();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await doctorService.getById(doctorProfileId);
        if (!active) return;
        setDoctor(response.data);
        const firstEnabled = MODE_ORDER.find((mode) => modeEnabled(response.data, mode));
        setSelectedMode(firstEnabled ?? null);
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
    IN_CLINIC: { enabled: doctor.availability?.inClinic.enabled ?? false, fee: doctor.availability?.inClinic.fee ?? null, duration: doctor.availability?.inClinic.durationMinutes ?? null },
    VIDEO: { enabled: doctor.availability?.video.enabled ?? false, fee: doctor.availability?.video.fee ?? null, duration: doctor.availability?.video.durationMinutes ?? null },
    VOICE: { enabled: doctor.availability?.voice.enabled ?? false, fee: doctor.availability?.voice.fee ?? null, duration: doctor.availability?.voice.durationMinutes ?? null },
  };

  const availableModes = MODE_ORDER.filter((mode) => modeEnabled(doctor, mode));
  const canBook = doctor.isAcceptingAppointments && availableModes.length > 0 && !!selectedMode;
  const chatConversationId = chatCta.state.kind === 'chat' ? chatCta.state.conversationId : null;

  function handleRequestAppointment() {
    if (!selectedMode) return;
    runWithProfileGate(() => navigation.navigate('BookAppointment', { doctorProfileId, consultationType: selectedMode }));
  }

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

      <Text style={styles.sectionTitle}>Choose a consultation type</Text>
      {availableModes.map((mode) => {
        const selected = selectedMode === mode;
        return (
          <TouchableOpacity
            key={mode}
            activeOpacity={activeopacity}
            style={[styles.modeCard, selected && styles.modeCardSelected]}
            onPress={() => setSelectedMode(mode)}
          >
            <View>
              <Text style={styles.modeName}>{CONSULT_LABEL[mode]}</Text>
              {modeFee[mode].duration ? <Text style={styles.modeDetail}>{modeFee[mode].duration} min</Text> : null}
            </View>
            <Text style={styles.modeFee}>{modeFee[mode].fee != null ? `₹${modeFee[mode].fee}` : 'Fee not available'}</Text>
          </TouchableOpacity>
        );
      })}
      {doctor.availability?.cancellationPolicy ? <Text style={styles.policyText}>{doctor.availability.cancellationPolicy}</Text> : null}

      <View style={styles.footer}>
        <Button
          label={canBook ? `Request ${CONSULT_LABEL[selectedMode!]} appointment` : 'Not accepting requests'}
          disabled={!canBook}
          onPress={handleRequestAppointment}
        />
        {chatCta.state.kind === 'invite' && (
          <Button
            label="Chat with doctor"
            variant="secondary"
            onPress={() => runWithProfileGate(chatCta.sendInvitation)}
            style={styles.chatButton}
          />
        )}
        {chatCta.state.kind === 'sending' && <Button label="Sending invitation…" variant="secondary" disabled onPress={() => {}} style={styles.chatButton} />}
        {chatCta.state.kind === 'pending' && (
          <Button label="Invitation sent — waiting for reply" variant="ghost" disabled onPress={() => {}} style={styles.chatButton} />
        )}
        {chatConversationId && (
          <Button
            label="Open chat"
            variant="secondary"
            onPress={() => navigation.navigate('ChatConversation', { conversationId: chatConversationId })}
            style={styles.chatButton}
          />
        )}
      </View>

      <ProfileGateDialog visible={dialogVisible} onComplete={handleCompleteProfile} onDismiss={handleDismissGate} />
    </ScreenContainer>
  );
};

function modeEnabled(doctor: DoctorDetail, mode: ConsultationType): boolean {
  if (mode === 'IN_CLINIC') return doctor.inClinicEnabled;
  if (mode === 'VIDEO') return doctor.videoEnabled;
  return doctor.voiceEnabled;
}

export default DoctorProfileScreen;
