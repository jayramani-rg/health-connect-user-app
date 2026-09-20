import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Icon } from '../../../components/Icon/Icon';
import type { IoniconsIconName } from '../../../components/Icon/Icon';
import { ProgressStepper } from '../../../components/ProgressStepper/ProgressStepper';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { TextField } from '../../../components/TextField/TextField';
import { AppointmentDateStrip } from '../components/AppointmentDateStrip/AppointmentDateStrip';
import { colors } from '../../../theme';
import { activeopacity, toLocalDateKey } from '../../../utils/helpers';
import { doctorService } from '../../../services/doctorService';
import { availabilityService } from '../../../services/availabilityService';
import { appointmentService } from '../../../services/appointmentService';
import type { RootStackParamList } from '../../../navigation/types';
import type { ConsultationType, DoctorDetail } from '../../doctors/types/doctor.types';
import type { AvailableSlot } from '../types/appointment.types';
import { CONSULT_LABEL } from '../utils/consultationType';
import { styles } from '../styles/BookAppointmentScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'BookAppointment'>;

const MODE_ORDER: ConsultationType[] = ['VIDEO', 'VOICE', 'IN_CLINIC'];
const STEP_LABELS = ['Consultation type', 'Date & time', 'Review'];
const MODE_ICON: Record<ConsultationType, IoniconsIconName> = {
  IN_CLINIC: 'home-outline',
  VIDEO: 'videocam-outline',
  VOICE: 'call-outline',
};
const MODE_SLOTS_HEADING: Record<ConsultationType, string> = {
  IN_CLINIC: 'Clinic Visit Slots',
  VIDEO: 'Video Consult Slots',
  VOICE: 'Voice Consult Slots',
};
const DATE_WINDOW_DAYS = 14;

function todayKey(): string {
  return toLocalDateKey(new Date());
}

function buildDateWindow(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: DATE_WINDOW_DAYS }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });
}

interface SlotGroup {
  key: 'morning' | 'afternoon' | 'evening';
  label: string;
  icon: IoniconsIconName;
  slots: AvailableSlot[];
}

function groupSlotsByPeriod(slots: AvailableSlot[]): SlotGroup[] {
  const morning: AvailableSlot[] = [];
  const afternoon: AvailableSlot[] = [];
  const evening: AvailableSlot[] = [];

  slots.forEach((slot) => {
    const hour = new Date(slot.startAtUtc).getHours();
    if (hour < 12) morning.push(slot);
    else if (hour < 17) afternoon.push(slot);
    else evening.push(slot);
  });

  const groups: SlotGroup[] = [
    { key: 'morning', label: 'Morning', icon: 'partly-sunny-outline', slots: morning },
    { key: 'afternoon', label: 'Afternoon', icon: 'sunny-outline', slots: afternoon },
    { key: 'evening', label: 'Evening', icon: 'moon-outline', slots: evening },
  ];
  return groups.filter((group) => group.slots.length > 0);
}

const BookAppointmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { doctorProfileId } = route.params;

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null);
  const [dateKey, setDateKey] = useState(todayKey());
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [slotCountsFailed, setSlotCountsFailed] = useState(false);

  const dateWindow = useMemo(buildDateWindow, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await doctorService.getById(doctorProfileId);
        if (!active) return;
        setDoctor(response.data);
        const firstEnabled = MODE_ORDER.find((mode) => modeEnabled(response.data, mode));
        setConsultationType(firstEnabled ?? null);
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : 'Could not load this doctor.');
      } finally {
        if (active) setLoadingDoctor(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [doctorProfileId]);

  const loadSlots = useCallback(async () => {
    if (!consultationType) return;
    setLoadingSlots(true);
    setSlotsMessage(null);
    setSlotsError(null);
    setSelectedSlot(null);
    try {
      const response = await availabilityService.getAvailableSlots(doctorProfileId, consultationType, dateKey);
      setSlots(response.data.slots);
      if (response.data.slots.length === 0) {
        setSlotsMessage(response.message || 'No slots available on this day.');
      }
    } catch (error) {
      setSlots([]);
      setSlotsError(error instanceof Error ? error.message : 'Could not load available slots.');
    } finally {
      setLoadingSlots(false);
    }
  }, [doctorProfileId, consultationType, dateKey]);

  useEffect(() => {
    if (step === 2) {
      loadSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, dateKey, consultationType]);

  const loadSlotCounts = useCallback(async () => {
    if (!consultationType) return;
    setSlotCountsFailed(false);
    try {
      const response = await availabilityService.getSlotCounts(doctorProfileId, consultationType, todayKey(), DATE_WINDOW_DAYS);
      const byDate: Record<string, number> = {};
      response.data.days.forEach((day) => {
        // day.date is an ISO date string ("2026-09-22T00:00:00") for an IST calendar date — slicing the
        // literal "yyyy-MM-dd" prefix avoids re-parsing it as a JS Date (which would re-interpret it
        // against the device's timezone and risk shifting the date by a day again).
        byDate[day.date.slice(0, 10)] = day.availableCount;
      });
      setSlotCounts(byDate);
    } catch {
      setSlotCounts({});
      setSlotCountsFailed(true);
    }
  }, [doctorProfileId, consultationType]);

  useEffect(() => {
    if (step === 2) {
      loadSlotCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, consultationType]);

  // A doctor can change their availability (hours, break, accepting-appointments toggle) at any time —
  // re-pull both the slot list and the date-strip counts whenever this screen regains focus, rather than
  // trusting whatever was fetched the last time it mounted.
  useFocusEffect(
    useCallback(() => {
      if (step === 2) {
        loadSlots();
        loadSlotCounts();
      }
    }, [step, loadSlots, loadSlotCounts]),
  );

  const modeFee = useMemo(() => {
    const a = doctor?.availability;
    const map: Record<ConsultationType, { fee: number | null; duration: number | null }> = {
      IN_CLINIC: { fee: a?.inClinicFee ?? doctor?.consultationFee ?? null, duration: a?.inClinicDurationMinutes ?? null },
      VIDEO: { fee: a?.videoFee ?? doctor?.consultationFee ?? null, duration: a?.videoDurationMinutes ?? null },
      VOICE: { fee: a?.voiceFee ?? doctor?.consultationFee ?? null, duration: a?.voiceDurationMinutes ?? null },
    };
    return map;
  }, [doctor]);

  const slotGroups = useMemo(() => groupSlotsByPeriod(slots), [slots]);

  const selectedDateHeading = useMemo(() => {
    const selected = dateWindow.find((d) => toLocalDateKey(d) === dateKey);
    return (selected ?? new Date()).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }, [dateWindow, dateKey]);

  async function handleSubmit() {
    if (!consultationType || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await appointmentService.book({
        doctorProfileId,
        consultationType,
        scheduledStartAtUtc: selectedSlot.startAtUtc,
        reason: reason.trim() || undefined,
      });
      navigation.replace('AppointmentConfirmation', { appointmentId: response.data.id });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not send this request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingDoctor) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <ScreenContainer>
        <Banner variant="error" message={loadError ?? 'Doctor not found.'} />
      </ScreenContainer>
    );
  }

  const availableModes = MODE_ORDER.filter((mode) => modeEnabled(doctor, mode));
  const canContinueFromMode = !!consultationType;
  const canContinueFromDateTime = !!selectedSlot;

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.headerBar} edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          {doctor.profilePhotoUrl ? (
            <Image source={{ uri: doctor.profilePhotoUrl }} style={styles.headerAvatarImage} />
          ) : (
            <Text style={styles.headerAvatarInitial}>{doctor.fullName.trim().charAt(0).toUpperCase() || '?'}</Text>
          )}
        </View>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerName} numberOfLines={1}>
            {doctor.fullName}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {doctor.specialization}
            {doctor.experienceYears > 0 ? ` · ${doctor.experienceYears} yrs experience` : ''}
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.stepperWrapper}>
        <ProgressStepper currentStep={step} totalSteps={3} stepLabel={STEP_LABELS[step - 1]} />
      </View>

      <ScreenContainer>
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>How would you like to consult {doctor.fullName}?</Text>
            {availableModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                activeOpacity={activeopacity}
                style={[styles.modeCard, consultationType === mode && styles.modeCardSelected]}
                onPress={() => setConsultationType(mode)}
              >
                <View style={styles.modeCardLeft}>
                  <Icon name={MODE_ICON[mode]} size={22} color={consultationType === mode ? colors.brand : colors.textSecondary} />
                  <View>
                    <Text style={styles.modeName}>{CONSULT_LABEL[mode]}</Text>
                    {modeFee[mode].duration ? <Text style={styles.modeDetail}>{modeFee[mode].duration} min</Text> : null}
                  </View>
                </View>
                <Text style={styles.modeFee}>₹{modeFee[mode].fee ?? '—'}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 2 && consultationType && (
          <>
            <View style={styles.slotsHeadingRow}>
              <View style={styles.slotsHeadingIcon}>
                <Icon name={MODE_ICON[consultationType]} size={18} color={colors.brand} />
              </View>
              <Text style={styles.slotsHeading}>{MODE_SLOTS_HEADING[consultationType]}</Text>
            </View>

            <AppointmentDateStrip
              days={dateWindow}
              selectedDate={dateKey}
              onSelectDate={setDateKey}
              counts={slotCounts}
              countsFailed={slotCountsFailed}
            />

            <Text style={styles.selectedDateHeading}>{selectedDateHeading}</Text>
            <View style={styles.divider} />

            {loadingSlots ? (
              <ActivityIndicator style={{ marginTop: 24 }} color={colors.brand} />
            ) : slotsError ? (
              <>
                <Banner variant="error" message={slotsError} />
                <TouchableOpacity onPress={loadSlots} style={styles.retryLink}>
                  <Text style={styles.retryLinkText}>Try again</Text>
                </TouchableOpacity>
              </>
            ) : slots.length === 0 ? (
              <Banner variant="info" message={slotsMessage ?? 'No slots available on this day.'} />
            ) : (
              slotGroups.map((group) => (
                <View key={group.key} style={styles.slotGroup}>
                  <View style={styles.groupHeaderRow}>
                    <Icon name={group.icon} size={18} color={colors.textSecondary} />
                    <Text style={styles.groupLabel}>{group.label}</Text>
                    <Text style={styles.groupCount}>{group.slots.length} slots</Text>
                  </View>
                  <View style={styles.slotsWrapper}>
                    {group.slots.map((slot) => {
                      const time = new Date(slot.startAtUtc);
                      const selected = selectedSlot?.startAtUtc === slot.startAtUtc;
                      return (
                        <TouchableOpacity
                          key={slot.startAtUtc}
                          activeOpacity={activeopacity}
                          style={[styles.slotChip, selected && styles.slotChipSelected]}
                          onPress={() => setSelectedSlot(slot)}
                        >
                          <Text style={[styles.slotText, selected && styles.slotTextSelected]}>
                            {time.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {step === 3 && consultationType && selectedSlot && (
          <>
            <Text style={styles.sectionTitle}>Review your request</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Doctor</Text>
                <Text style={styles.summaryValue}>{doctor.fullName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Consultation</Text>
                <Text style={styles.summaryValue}>{CONSULT_LABEL[consultationType]}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>When</Text>
                <Text style={styles.summaryValue}>
                  {new Date(selectedSlot.startAtUtc).toLocaleString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fee</Text>
                <Text style={styles.summaryValue}>₹{modeFee[consultationType].fee ?? doctor.consultationFee}</Text>
              </View>
            </View>
            <TextField
              label="Reason for visit (optional)"
              value={reason}
              onChangeText={setReason}
              placeholder="Briefly describe your concern"
              multiline
            />
            {submitError && <Banner variant="error" message={submitError} />}
          </>
        )}
      </ScreenContainer>

      <View style={styles.footer}>
        {step > 1 && (
          <View style={styles.footerButton}>
            <Button label="Back" variant="secondary" onPress={() => setStep(step - 1)} disabled={submitting} />
          </View>
        )}
        <View style={styles.footerButton}>
          {step < 3 ? (
            <Button
              label="Continue"
              onPress={() => setStep(step + 1)}
              disabled={step === 1 ? !canContinueFromMode : !canContinueFromDateTime}
            />
          ) : (
            <Button label="Send request" onPress={handleSubmit} loading={submitting} />
          )}
        </View>
      </View>
    </View>
  );
};

function modeEnabled(doctor: DoctorDetail, mode: ConsultationType): boolean {
  if (mode === 'IN_CLINIC') return doctor.inClinicEnabled;
  if (mode === 'VIDEO') return doctor.videoEnabled;
  return doctor.voiceEnabled;
}

export default BookAppointmentScreen;
