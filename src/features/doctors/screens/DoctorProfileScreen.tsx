import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button/Button';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { Icon } from '../../../components/Icon/Icon';
import { ProviderHero, type ProviderHeroChip } from '../../../components/ProviderHero/ProviderHero';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SectionHeader } from '../../../components/SectionHeader/SectionHeader';
import { SkeletonBlock, SkeletonCard } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors } from '../../../theme';
import { toLocalDateKey } from '../../../utils/helpers';
import { formatFee, joinArea } from '../../../utils/providerFormat';
import { doctorService } from '../../../services/doctorService';
import { availabilityService } from '../../../services/availabilityService';
import type { RootStackParamList } from '../../../navigation/types';
import { CONSULT_LABEL } from '../../appointments/utils/consultationType';
import type { ConsultationType, DoctorDetail } from '../types/doctor.types';
import { ConsultationModePicker, type ConsultationModeOption } from '../components/ConsultationModePicker/ConsultationModePicker';
import { useChatCta } from '../../chat/hooks/useChatCta';
import { useProfileGate } from '../../profile/hooks/useProfileGate';
import { ProfileGateDialog } from '../../profile/components/ProfileGateDialog';
import { styles } from '../styles/DoctorProfileScreen.styles';
import { getErrorMessage } from '../../../utils/errors';

type Props = NativeStackScreenProps<RootStackParamList, 'DoctorProfile'>;

const MODE_ORDER: ConsultationType[] = ['VIDEO', 'VOICE', 'IN_CLINIC'];
const AVAILABILITY_DAYS = 7;
const BIO_PREVIEW_LINES = 4;

type AvailabilityState = { kind: 'loading' } | { kind: 'open'; dateKey: string; count: number } | { kind: 'none' } | { kind: 'unknown' };

function modeOptions(doctor: DoctorDetail): ConsultationModeOption[] {
  const a = doctor.availability;
  return MODE_ORDER.map((mode) => {
    const entry = mode === 'IN_CLINIC' ? a?.inClinic : mode === 'VIDEO' ? a?.video : a?.voice;
    const enabled = mode === 'IN_CLINIC' ? doctor.inClinicEnabled : mode === 'VIDEO' ? doctor.videoEnabled : doctor.voiceEnabled;
    return { mode, enabled, fee: entry?.fee ?? null, durationMinutes: entry?.durationMinutes ?? null };
  });
}

function dayLabel(dateKey: string): string {
  const today = toLocalDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateKey === today) return 'today';
  if (dateKey === toLocalDateKey(tomorrow)) return 'tomorrow';
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

const DoctorProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { doctorProfileId } = route.params;
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ConsultationType | null>(null);
  const [availability, setAvailability] = useState<AvailabilityState>({ kind: 'loading' });
  const [bioExpanded, setBioExpanded] = useState(false);
  const chatCta = useChatCta('DOCTOR', doctorProfileId);
  const { runWithProfileGate, dialogVisible, handleCompleteProfile, handleDismissGate } = useProfileGate();

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await doctorService.getById(doctorProfileId);
      setDoctor(response.data);
      setSelectedMode((current) => current ?? modeOptions(response.data).find((o) => o.enabled)?.mode ?? null);
    } catch (error) {
      setErrorText(getErrorMessage(error, 'Could not load this doctor.'));
    } finally {
      setLoading(false);
    }
  }, [doctorProfileId]);

  useEffect(() => {
    load();
  }, [load]);

  const accepting = doctor?.isAcceptingAppointments ?? false;
  useEffect(() => {
    if (!selectedMode || !accepting) {
      setAvailability({ kind: 'unknown' });
      return undefined;
    }
    let active = true;
    setAvailability({ kind: 'loading' });
    availabilityService
      .getSlotCounts(doctorProfileId, selectedMode, toLocalDateKey(new Date()), AVAILABILITY_DAYS)
      .then((response) => {
        if (!active) return;
        const first = response.data.days.find((day) => day.availableCount > 0);
        setAvailability(first ? { kind: 'open', dateKey: first.date.slice(0, 10), count: first.availableCount } : { kind: 'none' });
      })
      .catch(() => active && setAvailability({ kind: 'unknown' }));
    return () => {
      active = false;
    };
  }, [doctorProfileId, selectedMode, accepting]);

  const options = useMemo(() => (doctor ? modeOptions(doctor) : []), [doctor]);

  if (loading) {
    return (
      <ScreenContainer variant="page">
        <SkeletonCard />
        <SkeletonBlock width="45%" height={16} />
        <View style={styles.skeletonRow}>
          <SkeletonBlock width="31%" height={112} radius={16} />
          <SkeletonBlock width="31%" height={112} radius={16} />
          <SkeletonBlock width="31%" height={112} radius={16} />
        </View>
        <SkeletonBlock width="100%" height={72} radius={16} />
      </ScreenContainer>
    );
  }

  if (!doctor) {
    return (
      <ScreenContainer variant="page">
        <EmptyState title="Could not load this doctor" description={errorText ?? 'Please try again.'} actionLabel="Try again" onActionPress={load} />
      </ScreenContainer>
    );
  }

  const selected = options.find((o) => o.mode === selectedMode && o.enabled) ?? null;
  const anyEnabled = options.some((o) => o.enabled);
  const canBook = accepting && !!selected;
  const credentials = doctor.qualifications.map((q) => q.degree).filter(Boolean).join(', ');
  const specialty = [doctor.specialization, doctor.subSpecialization].filter(Boolean).join(' · ');
  const area = joinArea(doctor.clinicLocality, doctor.clinicCity);
  const meta = [doctor.experienceYears > 0 ? `${doctor.experienceYears} years experience` : null, area || null].filter(Boolean).join(' · ');
  const clinicAddress = [doctor.clinicName, doctor.clinicAddress, doctor.clinicLocality, doctor.clinicCity, doctor.clinicPincode].filter(Boolean).join(', ');
  const chatConversationId = chatCta.state.kind === 'chat' ? chatCta.state.conversationId : null;

  const chips: ProviderHeroChip[] = [];
  if (!accepting) {
    chips.push({ icon: 'pause-circle-outline', label: 'Not taking appointments', tone: 'warning' });
  } else if (availability.kind === 'open') {
    chips.push({ icon: 'calendar-outline', label: `Available ${dayLabel(availability.dateKey)}`, tone: 'brand' });
  }
  if (doctor.minConsultationFee != null) {
    chips.push({ icon: 'wallet-outline', label: `From ${formatFee(doctor.minConsultationFee)}` });
  }

  function handleBook() {
    if (!selected) return;
    runWithProfileGate(() => navigation.navigate('BookAppointment', { doctorProfileId, consultationType: selected.mode }));
  }

  const availabilityLine =
    !accepting
      ? 'This doctor is not accepting new appointment requests right now.'
      : availability.kind === 'loading'
        ? 'Checking availability…'
        : availability.kind === 'open'
          ? `Next opening ${dayLabel(availability.dateKey)} · ${availability.count} ${availability.count === 1 ? 'slot' : 'slots'}`
          : availability.kind === 'none'
            ? `No ${selected ? CONSULT_LABEL[selected.mode].toLowerCase() : ''} openings in the next ${AVAILABILITY_DAYS} days`
            : null;

  const footer = (
    <View style={styles.footer}>
      <View style={styles.footerText}>
        <Text style={styles.footerFee}>{selected ? (selected.fee != null ? formatFee(selected.fee) : 'Fee on request') : '—'}</Text>
        <Text style={styles.footerMeta} numberOfLines={1}>
          {selected ? `${CONSULT_LABEL[selected.mode]}${selected.durationMinutes ? ` · ${selected.durationMinutes} min` : ''}` : 'No consultation available'}
        </Text>
      </View>
      <View style={styles.footerCta}>
        <Button label={accepting ? 'Book appointment' : 'Unavailable'} onPress={handleBook} disabled={!canBook} />
      </View>
    </View>
  );

  return (
    <ScreenContainer variant="page" footer={footer}>
      <ProviderHero
        name={doctor.fullName}
        imageUrl={doctor.profilePhotoUrl}
        shape="circle"
        verified={doctor.isVerified}
        title={specialty}
        subtitle={credentials || null}
        meta={meta || null}
        chips={chips}
      />

      <SectionHeader title="Consultation type" style={styles.section} />
      {anyEnabled ? (
        <>
          <ConsultationModePicker options={options} value={selectedMode} onChange={setSelectedMode} />
          {availabilityLine ? (
            <View style={styles.availabilityRow} accessibilityLiveRegion="polite">
              <Icon name={availability.kind === 'open' ? 'time-outline' : 'information-circle-outline'} size={15} color={availability.kind === 'open' ? colors.success : colors.textSecondary} />
              <Text style={[styles.availabilityText, availability.kind === 'open' && styles.availabilityOpen]}>{availabilityLine}</Text>
            </View>
          ) : null}
        </>
      ) : (
        <Text style={styles.bodyMuted}>This doctor has not opened any consultation types yet.</Text>
      )}

      {doctor.inClinicEnabled && clinicAddress ? (
        <View style={[styles.infoCard, selected?.mode === 'IN_CLINIC' && styles.infoCardActive]}>
          <View style={styles.infoIcon}>
            <Icon name="location-outline" size={18} color={colors.brand} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{doctor.clinicName || 'Clinic'}</Text>
            <Text style={styles.infoBody}>{clinicAddress}</Text>
          </View>
        </View>
      ) : null}

      {doctor.bio ? (
        <>
          <SectionHeader title="About" style={styles.section} />
          <Text style={styles.body} numberOfLines={bioExpanded ? undefined : BIO_PREVIEW_LINES}>
            {doctor.bio}
          </Text>
          {doctor.bio.length > 220 ? (
            <Pressable onPress={() => setBioExpanded((v) => !v)} hitSlop={8} accessibilityRole="button">
              <Text style={styles.link}>{bioExpanded ? 'Show less' : 'Read more'}</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

      {doctor.qualifications.length > 0 ? (
        <>
          <SectionHeader title="Education" style={styles.section} />
          <View style={styles.list}>
            {doctor.qualifications.map((q, index) => (
              <View key={`${q.degree}-${index}`} style={[styles.listRow, index > 0 && styles.listRowDivider]}>
                <Icon name="school-outline" size={16} color={colors.textSecondary} />
                <View style={styles.infoText}>
                  <Text style={styles.listTitle}>{q.degree}</Text>
                  <Text style={styles.listMeta}>
                    {q.institution}
                    {q.passingYear ? ` · ${q.passingYear}` : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {doctor.availability?.cancellationPolicy ? (
        <>
          <SectionHeader title="Cancellation policy" style={styles.section} />
          <Text style={styles.bodyMuted}>{doctor.availability.cancellationPolicy}</Text>
        </>
      ) : null}

      <View style={styles.chatCard}>
        <Icon name="chatbubbles-outline" size={18} color={colors.brand} />
        <Text style={styles.chatText}>
          {chatCta.state.kind === 'pending' ? 'Chat invitation sent. Waiting for a reply.' : 'Have a question before booking?'}
        </Text>
        {chatCta.state.kind === 'invite' ? (
          <Button label="Message" variant="secondary" onPress={() => runWithProfileGate(chatCta.sendInvitation)} style={styles.chatButton} />
        ) : chatCta.state.kind === 'sending' ? (
          <Button label="Sending" variant="secondary" disabled loading onPress={() => undefined} style={styles.chatButton} />
        ) : chatConversationId ? (
          <Button label="Open chat" variant="secondary" onPress={() => navigation.navigate('ChatConversation', { conversationId: chatConversationId })} style={styles.chatButton} />
        ) : null}
      </View>

      <ProfileGateDialog visible={dialogVisible} onComplete={handleCompleteProfile} onDismiss={handleDismissGate} />
    </ScreenContainer>
  );
};

export default DoctorProfileScreen;
