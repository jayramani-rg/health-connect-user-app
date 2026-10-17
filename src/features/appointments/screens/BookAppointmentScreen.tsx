import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StatusBar, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button } from '../../../components/Button/Button';
import { EmptyCard } from '../../../components/EmptyCard/EmptyCard';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { Icon } from '../../../components/Icon/Icon';
import { IconButton } from '../../../components/IconButton/IconButton';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SectionHeader } from '../../../components/SectionHeader/SectionHeader';
import { SkeletonBlock, SkeletonCard } from '../../../components/SkeletonLoader/SkeletonLoader';
import { TextField } from '../../../components/TextField/TextField';
import { colors, layout } from '../../../theme';
import { toLocalDateKey } from '../../../utils/helpers';
import { haptics } from '../../../utils/haptics';
import { fadeEntering } from '../../../utils/motion';
import { getErrorMessage } from '../../../utils/errors';
import { doctorService } from '../../../services/doctorService';
import type { RootStackParamList } from '../../../navigation/types';
import type { DoctorDetail } from '../../doctors/types/doctor.types';
import type { AvailableSlot, BookingRequest, BookingRequestStatus, ConsultationType } from '../types/appointment.types';
import { CONSULT_LABEL } from '../utils/consultationType';
import { AppointmentDateStrip } from '../components/AppointmentDateStrip/AppointmentDateStrip';
import { DoctorSummaryCard, formatFee, MODE_ICON } from '../components/DoctorSummaryCard/DoctorSummaryCard';
import { formatSlotTime, SlotChip, SlotGridSkeleton, SlotLegend } from '../components/SlotChip/SlotChip';
import { SLOT_GAP } from '../components/SlotChip/styles/SlotChip.styles';
import { BookingFooter } from '../components/BookingFooter/BookingFooter';
import { useBookingRequest } from '../hooks/useBookingRequest';
import { useCountdown } from '../hooks/useCountdown';
import { useDoctorSlots } from '../hooks/useDoctorSlots';
import { countOpen, groupSlotsByPeriod, isActiveRequest, nextOpenDateKey, resolveSlotState, slotStatus } from '../utils/slotState';
import { styles } from '../styles/BookAppointmentScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'BookAppointment'>;

const MODE_ORDER: ConsultationType[] = ['VIDEO', 'VOICE', 'IN_CLINIC'];
const DATE_WINDOW_DAYS = 14;
const WIDE_GRID_MIN = 360;
const MAX_CONTENT_WIDTH = 560;

function buildDateWindow(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: DATE_WINDOW_DAYS }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });
}

function modeEnabled(doctor: DoctorDetail, mode: ConsultationType): boolean {
  if (mode === 'IN_CLINIC') return doctor.inClinicEnabled;
  if (mode === 'VIDEO') return doctor.videoEnabled;
  return doctor.voiceEnabled;
}

function modeSettings(doctor: DoctorDetail | null, mode: ConsultationType | null): { fee: number | null; duration: number | null } {
  const availability = doctor?.availability;
  if (!availability || !mode) return { fee: null, duration: null };
  const entry = mode === 'IN_CLINIC' ? availability.inClinic : mode === 'VIDEO' ? availability.video : availability.voice;
  return { fee: entry.fee, duration: entry.durationMinutes };
}

function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

const PERIOD_ICON = { morning: 'partly-sunny-outline', afternoon: 'sunny-outline', evening: 'moon-outline' } as const;

const BookAppointmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { doctorProfileId, consultationType: preselectedType } = route.params;
  const { width } = useWindowDimensions();

  const [doctor, setDoctor] = useState<DoctorDetail | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(preselectedType ? 2 : 1);
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(preselectedType ?? null);
  const dateWindow = useMemo(buildDateWindow, []);
  const dateKeys = useMemo(() => dateWindow.map(toLocalDateKey), [dateWindow]);
  const [dateKey, setDateKey] = useState(dateKeys[0]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);

  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - layout.gutter * 2;
  const columns = contentWidth >= WIDE_GRID_MIN ? 4 : 3;
  const chipWidth = Math.floor((contentWidth - SLOT_GAP * (columns - 1)) / columns);

  const loadDoctor = useCallback(async () => {
    setLoadingDoctor(true);
    setLoadError(null);
    try {
      const response = await doctorService.getById(doctorProfileId);
      const loaded = response.data;
      const fallback = MODE_ORDER.find((mode) => modeEnabled(loaded, mode)) ?? null;
      setDoctor(loaded);
      setConsultationType((current) => (current && modeEnabled(loaded, current) ? current : fallback));
      if (preselectedType && !modeEnabled(loaded, preselectedType)) {
        setStep(1);
      }
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not load this doctor.'));
    } finally {
      setLoadingDoctor(false);
    }
  }, [doctorProfileId, preselectedType]);

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  const slots = useDoctorSlots({
    doctorProfileId,
    consultationType,
    dateKey,
    fromDateKey: dateKeys[0],
    days: DATE_WINDOW_DAYS,
    enabled: step === 2 && !!doctor,
  });
  const booking = useBookingRequest(doctorProfileId);
  const { refresh: refreshBooking, setError: setBookingError } = booking;
  const activeRequest = isActiveRequest(booking.request) ? booking.request : null;
  const remaining = useCountdown(booking.request?.status === 'RESERVED' ? booking.request.reservationExpiresAtUtc : null, booking.skewMs);

  const refreshSlots = slots.refresh;
  useFocusEffect(
    useCallback(() => {
      refreshSlots();
      refreshBooking();
    }, [refreshSlots, refreshBooking]),
  );

  const goToPayment = useCallback(
    (request: BookingRequest) => {
      if (request.appointmentId) {
        navigation.navigate('PaymentSummary', { kind: 'APPOINTMENT', bookingId: request.appointmentId });
      }
    },
    [navigation],
  );

  const jumpedToRequest = useRef(false);
  useEffect(() => {
    if (!activeRequest || jumpedToRequest.current) return;
    jumpedToRequest.current = true;
    const requestDay = toLocalDateKey(new Date(activeRequest.scheduledStartAtUtc));
    if (dateKeys.includes(requestDay)) setDateKey(requestDay);
    setConsultationType(activeRequest.consultationType);
    setStep(2);
  }, [activeRequest, dateKeys]);

  const previousStatus = useRef<BookingRequestStatus | null>(null);
  const requestStatus = booking.request?.status ?? null;
  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = requestStatus;
    if (!requestStatus || previous === requestStatus) return;
    refreshSlots();
    if (previous === 'WAITING' && requestStatus === 'RESERVED' && booking.request) {
      haptics.success();
      goToPayment(booking.request);
    } else if (previous === 'WAITING' && requestStatus === 'CLOSED') {
      haptics.warning();
    }
  }, [requestStatus, booking.request, goToPayment, refreshSlots]);

  useEffect(() => {
    if (!selectedStart) return;
    const current = slots.slots.find((slot) => slot.startAtUtc === selectedStart);
    if (current && (slotStatus(current) === 'BOOKED' || slotStatus(current) === 'UNAVAILABLE')) {
      setSelectedStart(null);
      setNotice('That time was just booked by someone else. Please pick another slot.');
      haptics.warning();
    }
  }, [slots.slots, selectedStart]);

  const selectedDate = dateWindow[Math.max(0, dateKeys.indexOf(dateKey))];
  const groups = useMemo(() => groupSlotsByPeriod(slots.slots), [slots.slots]);
  const openCount = countOpen(slots.slots);
  const nextOpen = nextOpenDateKey(dateKeys, slots.counts, dateKey);
  const { fee, duration } = modeSettings(doctor, consultationType);
  const selectedSlot = selectedStart ? slots.slots.find((slot) => slot.startAtUtc === selectedStart) ?? null : null;

  const selectDate = useCallback((key: string) => {
    setDateKey(key);
    setSelectedStart(null);
    setNotice(null);
  }, []);

  const handleSlotPress = useCallback(
    (slot: AvailableSlot) => {
      const state = resolveSlotState(slot, { selectedStart, processingStart: null, activeRequest });
      if (state === 'held' && activeRequest?.status === 'RESERVED') {
        goToPayment(activeRequest);
        return;
      }
      if (state === 'waiting') return;
      if (activeRequest) {
        setBookingError(activeRequest.status === 'WAITING' ? 'Leave the queue before choosing another time.' : 'Complete or release your reserved slot first.');
        return;
      }
      haptics.selection();
      setNotice(null);
      setBookingError(null);
      setSelectedStart((current) => (current === slot.startAtUtc ? null : slot.startAtUtc));
    },
    [selectedStart, activeRequest, goToPayment, setBookingError],
  );

  async function handleContinue() {
    if (!selectedStart || !consultationType) return;
    haptics.light();
    const result = await booking.submit({
      doctorProfileId,
      consultationType,
      scheduledStartAtUtc: selectedStart,
      reason: reason.trim() || undefined,
    });
    if (!result) {
      refreshSlots();
      return;
    }
    setSelectedStart(null);
    if (result.status === 'RESERVED') {
      haptics.success();
      goToPayment(result);
    } else if (result.status === 'CONFIRMED' && result.appointmentId) {
      navigation.replace('AppointmentConfirmation', { appointmentId: result.appointmentId });
    }
  }

  async function handleLeaveQueue() {
    await booking.cancel();
    refreshSlots();
  }

  function handleDismiss() {
    booking.dismiss();
    refreshSlots();
  }

  const header = (
    <SafeAreaView edges={['top']} style={styles.header}>
      <View style={styles.headerRow}>
        <IconButton icon="arrow-back" variant="plain" accessibilityLabel="Go back" onPress={() => (step === 2 && !preselectedType && !activeRequest ? setStep(1) : navigation.goBack())} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1} accessibilityRole="header">
            {step === 1 ? 'Choose consultation' : 'Pick a time'}
          </Text>
          <Text style={styles.headerMeta}>Step {step} of 2</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, step === 1 ? styles.progressHalf : styles.progressFull]} />
      </View>
    </SafeAreaView>
  );

  if (loadingDoctor) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        {header}
        <View style={styles.loadingBody}>
          <SkeletonCard />
          <SkeletonBlock width="40%" height={16} />
          <SlotGridSkeleton width={chipWidth} count={columns * 3} />
        </View>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.root}>
        {header}
        <ScreenContainer variant="page">
          <EmptyState title="Could not load this doctor" description={loadError ?? 'Please try again.'} actionLabel="Try again" onActionPress={loadDoctor} />
        </ScreenContainer>
      </View>
    );
  }

  const availableModes = MODE_ORDER.filter((mode) => modeEnabled(doctor, mode));
  const summaryCard = (
    <DoctorSummaryCard
      name={doctor.fullName}
      specialization={doctor.specialization}
      experienceYears={doctor.experienceYears}
      photoUrl={doctor.profilePhotoUrl}
      consultationType={step === 2 ? consultationType : null}
      fee={fee}
      durationMinutes={duration}
      location={consultationType === 'IN_CLINIC' ? [doctor.clinicName, doctor.clinicLocality, doctor.clinicCity].filter(Boolean).join(', ') : null}
      onChangeType={step === 2 && availableModes.length > 1 && !activeRequest ? () => setStep(1) : undefined}
    />
  );

  if (step === 1) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" />
        {header}
        <ScreenContainer
          variant="page"
          footer={<Button label="Continue" onPress={() => setStep(2)} disabled={!consultationType} />}
        >
          {summaryCard}
          <SectionHeader title="How would you like to consult?" />
          {availableModes.length === 0 ? (
            <EmptyCard icon="calendar-clear-outline" title="Not taking bookings" description="This doctor has not opened any consultation types yet." />
          ) : (
            <View style={styles.modeList} accessibilityRole="radiogroup">
              {availableModes.map((mode) => {
                const selected = consultationType === mode;
                const settings = modeSettings(doctor, mode);
                return (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      haptics.selection();
                      setConsultationType(mode);
                      setSelectedStart(null);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`${CONSULT_LABEL[mode]}, ${settings.duration ?? ''} minutes, ${formatFee(settings.fee)}`}
                    style={({ pressed }) => [styles.modeCard, selected && styles.modeCardSelected, pressed && styles.modeCardPressed]}
                  >
                    <View style={[styles.modeIcon, selected && styles.modeIconSelected]}>
                      <Icon name={MODE_ICON[mode]} size={20} color={selected ? colors.white : colors.brand} />
                    </View>
                    <View style={styles.modeText}>
                      <Text style={styles.modeName}>{CONSULT_LABEL[mode]}</Text>
                      <Text style={styles.modeDetail}>{settings.duration ? `${settings.duration} min session` : 'Duration on request'}</Text>
                    </View>
                    <Text style={styles.modeFee}>{formatFee(settings.fee)}</Text>
                    <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScreenContainer>
      </View>
    );
  }

  const footerDetail = [consultationType ? CONSULT_LABEL[consultationType] : null, duration ? `${duration} min` : null, formatFee(fee)].filter(Boolean).join(' · ');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {header}
      <ScreenContainer
        variant="page"
        footer={
          <BookingFooter
            selection={
              selectedSlot
                ? { dateLabel: formatDay(new Date(selectedSlot.startAtUtc)), timeLabel: formatSlotTime(selectedSlot.startAtUtc), joinsQueue: slotStatus(selectedSlot) === 'RESERVED' }
                : null
            }
            detail={footerDetail}
            request={booking.request}
            remainingMs={remaining}
            submitting={booking.submitting}
            cancelling={booking.cancelling}
            error={booking.error}
            onContinue={handleContinue}
            onLeaveQueue={handleLeaveQueue}
            onResumePayment={() => booking.request && goToPayment(booking.request)}
            onDismiss={handleDismiss}
          />
        }
      >
        {summaryCard}

        <SectionHeader title="Date" meta={selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} style={styles.sectionTight} />
        <AppointmentDateStrip
          days={dateWindow}
          selectedDate={dateKey}
          onSelectDate={selectDate}
          counts={slots.counts}
          countsLoaded={slots.countsLoaded}
          countsFailed={slots.countsFailed}
        />

        <SectionHeader
          title={formatDay(selectedDate)}
          meta={slots.loading ? undefined : openCount > 0 ? `${openCount} open` : undefined}
          style={styles.sectionTight}
        />
        <SlotLegend />

        {notice ? (
          <View style={styles.notice} accessibilityLiveRegion="polite">
            <Icon name="information-circle-outline" size={16} color={colors.warning} />
            <Text style={styles.noticeText}>{notice}</Text>
          </View>
        ) : null}

        {slots.loading ? (
          <SlotGridSkeleton width={chipWidth} count={columns * 3} />
        ) : slots.error ? (
          <EmptyCard icon="cloud-offline-outline" title="Could not load times" description={slots.error} actionLabel="Try again" onActionPress={() => slots.reload()} />
        ) : !slots.accepting ? (
          <EmptyCard icon="pause-circle-outline" title="Not accepting bookings" description="This doctor has paused new appointments. Please check back later." />
        ) : slots.slots.length === 0 ? (
          <EmptyCard
            icon="calendar-clear-outline"
            title="No times on this day"
            description={nextOpen ? 'The doctor has open times on another day.' : 'The doctor has no open times in the next two weeks.'}
            actionLabel={nextOpen ? `Go to ${formatDay(dateWindow[dateKeys.indexOf(nextOpen)])}` : undefined}
            onActionPress={nextOpen ? () => selectDate(nextOpen) : undefined}
          />
        ) : (
          <Animated.View key={`${dateKey}-${consultationType}`} entering={fadeEntering()} style={styles.groups}>
            {groups.map((group) => {
              const open = countOpen(group.slots);
              return (
                <View key={group.key} style={styles.group}>
                  <View style={styles.groupHeader}>
                    <Icon name={PERIOD_ICON[group.key]} size={16} color={colors.textSecondary} />
                    <Text style={styles.groupLabel}>{group.label}</Text>
                    <Text style={styles.groupMeta}>{open > 0 ? `${open} open` : 'Fully booked'}</Text>
                  </View>
                  <View style={styles.grid}>
                    {group.slots.map((slot) => (
                      <SlotChip
                        key={slot.startAtUtc}
                        slot={slot}
                        width={chipWidth}
                        onPress={handleSlotPress}
                        state={resolveSlotState(slot, {
                          selectedStart,
                          processingStart: booking.submitting ? selectedStart : null,
                          activeRequest,
                        })}
                      />
                    ))}
                  </View>
                </View>
              );
            })}
            {openCount === 0 && nextOpen ? (
              <Pressable onPress={() => selectDate(nextOpen)} accessibilityRole="button" style={styles.nextOpen}>
                <Text style={styles.nextOpenText}>Next open day: {formatDay(dateWindow[dateKeys.indexOf(nextOpen)])}</Text>
                <Icon name="chevron-forward" size={14} color={colors.brand} />
              </Pressable>
            ) : null}
          </Animated.View>
        )}

        {!activeRequest ? (
          noteOpen ? (
            <TextField label="Note for the doctor (optional)" value={reason} onChangeText={setReason} placeholder="Briefly describe your concern" multiline maxLength={1000} />
          ) : (
            <Pressable onPress={() => setNoteOpen(true)} accessibilityRole="button" style={styles.addNote}>
              <Icon name="create-outline" size={16} color={colors.brand} />
              <Text style={styles.addNoteText}>{reason ? 'Edit note for the doctor' : 'Add a note for the doctor'}</Text>
            </Pressable>
          )
        ) : null}
      </ScreenContainer>
    </View>
  );
};

export default BookAppointmentScreen;
