import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ProgressStepper } from '../../../components/ProgressStepper/ProgressStepper';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { TextField } from '../../../components/TextField/TextField';
import { DateStrip } from '../../../components/DateStrip/DateStrip';
import { colors } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
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

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
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
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    setSelectedSlot(null);
    try {
      const response = await availabilityService.getAvailableSlots(doctorProfileId, consultationType, dateKey);
      setSlots(response.data.slots);
      if (response.data.slots.length === 0) {
        setSlotsMessage(response.message || 'No slots available on this day.');
      }
    } catch (error) {
      setSlots([]);
      setSlotsMessage(error instanceof Error ? error.message : 'Could not load available slots.');
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

  const modeFee = useMemo(() => {
    const a = doctor?.availability;
    const map: Record<ConsultationType, { fee: number | null; duration: number | null }> = {
      IN_CLINIC: { fee: a?.inClinicFee ?? doctor?.consultationFee ?? null, duration: a?.inClinicDurationMinutes ?? null },
      VIDEO: { fee: a?.videoFee ?? doctor?.consultationFee ?? null, duration: a?.videoDurationMinutes ?? null },
      VOICE: { fee: a?.voiceFee ?? doctor?.consultationFee ?? null, duration: a?.voiceDurationMinutes ?? null },
    };
    return map;
  }, [doctor]);

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
                <View>
                  <Text style={styles.modeName}>{CONSULT_LABEL[mode]}</Text>
                  {modeFee[mode].duration ? <Text style={styles.modeDetail}>{modeFee[mode].duration} min</Text> : null}
                </View>
                <Text style={styles.modeFee}>₹{modeFee[mode].fee ?? '—'}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {step === 2 && consultationType && (
          <>
            <Text style={styles.sectionTitle}>Pick a date and time</Text>
            <DateStrip selectedDate={dateKey} onSelectDate={setDateKey} />
            {loadingSlots ? (
              <ActivityIndicator style={{ marginTop: 24 }} color={colors.brand} />
            ) : slots.length === 0 ? (
              <Banner variant="info" message={slotsMessage ?? 'No slots available on this day.'} />
            ) : (
              <View style={styles.slotsWrapper}>
                {slots.map((slot) => {
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
