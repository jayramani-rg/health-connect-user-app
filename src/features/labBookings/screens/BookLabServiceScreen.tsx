import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { EmptyCard } from '../../../components/EmptyCard/EmptyCard';
import { Icon } from '../../../components/Icon/Icon';
import { ProgressStepper } from '../../../components/ProgressStepper/ProgressStepper';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SectionHeader } from '../../../components/SectionHeader/SectionHeader';
import { SkeletonBlock, SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import { TextField } from '../../../components/TextField/TextField';
import { colors, layout } from '../../../theme';
import { activeopacity, toLocalDateKey } from '../../../utils/helpers';
import { haptics } from '../../../utils/haptics';
import { fadeEntering } from '../../../utils/motion';
import { labService } from '../../../services/labService';
import { labBookingService } from '../../../services/labBookingService';
import { dependentService } from '../../../services/dependentService';
import { patientAddressService } from '../../../services/patientAddressService';
import type { RootStackParamList } from '../../../navigation/types';
import type { NormalizedError } from '../../../types/common.types';
import type { LabDetail } from '../../labs/types/lab.types';
import type { Dependent, PatientAddress } from '../../patients/types/patient.types';
import type { AvailableLabSlot, CollectionMethod, HomeCollectionEligibility } from '../types/labBooking.types';
import type { SlotVisualState } from '../../appointments/utils/slotState';
import { countOpen, groupSlotsByPeriod, nextOpenDateKey, resolveSlotState, slotConsumesCapacity, slotStatus } from '../../appointments/utils/slotState';
import { AppointmentDateStrip } from '../../appointments/components/AppointmentDateStrip/AppointmentDateStrip';
import { formatSlotTime, SlotChip, SlotGridSkeleton, SlotLegend } from '../../appointments/components/SlotChip/SlotChip';
import { SLOT_GAP } from '../../appointments/components/SlotChip/styles/SlotChip.styles';
import { routeAfterBooking } from '../../payments/utils/routeAfterBooking';
import { useLabSlots } from '../hooks/useLabSlots';
import { styles } from '../styles/BookLabServiceScreen.styles';
import { getErrorMessage } from '../../../utils/errors';

type Props = NativeStackScreenProps<RootStackParamList, 'BookLabService'>;

const STEP_LABELS: Record<number, string> = { 1: 'Patient & method', 2: 'Date & time', 3: 'Collection address', 4: 'Review' };

type EligibilityState = { status: 'checking' } | { status: 'done'; result: HomeCollectionEligibility } | { status: 'error'; message: string };

const DATE_WINDOW_DAYS = 14;
const WIDE_GRID_MIN = 360;
const MAX_CONTENT_WIDTH = 560;
const PERIOD_ICON = { morning: 'partly-sunny-outline', afternoon: 'sunny-outline', evening: 'moon-outline' } as const;
const VISIT_LEGEND: SlotVisualState[] = ['available', 'selected', 'booked', 'unavailable'];
const HOME_LEGEND: SlotVisualState[] = ['available', 'selected', 'unavailable'];
const SLOT_TAKEN_NOTICE = 'That time is no longer available. Please pick another slot.';

function buildDateWindow(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: DATE_WINDOW_DAYS }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });
}

function formatDay(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatAddress(a: PatientAddress): string {
  return [a.line1, a.line2, a.locality, a.city].filter(Boolean).join(', ') + ` ${a.pincode}`;
}

const BookLabServiceScreen: React.FC<Props> = ({ route, navigation }) => {
  const { laboratoryId, serviceIds } = route.params;

  const [lab, setLab] = useState<LabDetail | null>(null);
  const [loadingLab, setLoadingLab] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [dependents, setDependents] = useState<Dependent[]>([]);

  const [step, setStep] = useState(1);
  const [dependentId, setDependentId] = useState<string | undefined>(undefined);
  const [collectionMethod, setCollectionMethod] = useState<CollectionMethod | null>(null);
  const [showAddDependent, setShowAddDependent] = useState(false);
  const [newDependent, setNewDependent] = useState({ firstName: '', lastName: '', relation: '' });

  const { width } = useWindowDimensions();
  const dateWindow = useMemo(buildDateWindow, []);
  const dateKeys = useMemo(() => dateWindow.map(toLocalDateKey), [dateWindow]);
  const [dateKey, setDateKey] = useState(dateKeys[0]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - layout.gutter * 2;
  const columns = contentWidth >= WIDE_GRID_MIN ? 4 : 3;
  const chipWidth = Math.floor((contentWidth - SLOT_GAP * (columns - 1)) / columns);

  const [addresses, setAddresses] = useState<PatientAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | undefined>(undefined);
  const [eligibility, setEligibility] = useState<Record<string, EligibilityState>>({});
  const knownAddressIds = useRef<Set<string> | null>(null);

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [labRes, depRes] = await Promise.all([labService.getById(laboratoryId), dependentService.listMine()]);
        setLab(labRes.data);
        setDependents(depRes.data);
      } catch (error) {
        setLoadError(getErrorMessage(error, 'Could not load booking details.'));
      } finally {
        setLoadingLab(false);
      }
    })();
  }, [laboratoryId]);

  const selectedServices = useMemo(() => lab?.services.filter((s) => serviceIds.includes(s.id)) ?? [], [lab, serviceIds]);

  const allowLabVisit = selectedServices.length > 0 && selectedServices.every((s) => s.labVisitEnabled);
  const allowHomeCollection = (lab?.homeCollectionEnabled ?? false) && selectedServices.length > 0 && selectedServices.every((s) => s.homeCollectionEnabled);

  const totalAmount = selectedServices.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0) + (collectionMethod === 'HOME_COLLECTION' ? lab?.homeCollectionFee ?? 0 : 0);

  const slots = useLabSlots({
    laboratoryId,
    collectionMethod,
    dateKey,
    fromDateKey: dateKeys[0],
    days: DATE_WINDOW_DAYS,
    enabled: step === 2 && !!collectionMethod,
  });
  const { refresh: refreshSlots, verifySlot } = slots;

  useFocusEffect(
    useCallback(() => {
      if (step === 2) refreshSlots();
    }, [step, refreshSlots]),
  );

  useEffect(() => {
    setSelectedStart(null);
    setNotice(null);
  }, [collectionMethod]);

  useEffect(() => {
    if (!selectedStart) return;
    const current = slots.slots.find((slot) => slot.startAtUtc === selectedStart);
    if (current && slotStatus(current) !== 'AVAILABLE') {
      setSelectedStart(null);
      setNotice(SLOT_TAKEN_NOTICE);
      haptics.warning();
    }
  }, [slots.slots, selectedStart]);

  const selectDate = useCallback((key: string) => {
    setDateKey(key);
    setSelectedStart(null);
    setNotice(null);
  }, []);

  const handleSlotPress = useCallback((slot: AvailableLabSlot) => {
    if (slotStatus(slot) !== 'AVAILABLE') return;
    haptics.selection();
    setNotice(null);
    setSelectedStart((current) => (current === slot.startAtUtc ? null : slot.startAtUtc));
  }, []);

  const returnToSlots = useCallback(
    (message: string) => {
      setSelectedStart(null);
      setNotice(message);
      setStep(2);
      refreshSlots();
      haptics.warning();
    },
    [refreshSlots],
  );

  const checkEligibility = useCallback(
    async (id: string) => {
      setEligibility((prev) => ({ ...prev, [id]: { status: 'checking' } }));
      try {
        const res = await labBookingService.checkHomeCollectionEligibility(laboratoryId, id);
        setEligibility((prev) => ({ ...prev, [id]: { status: 'done', result: res.data } }));
      } catch (error) {
        setEligibility((prev) => ({
          ...prev,
          [id]: { status: 'error', message: getErrorMessage(error, "Couldn't check this address.") },
        }));
      }
    },
    [laboratoryId],
  );

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    setAddressError(null);
    try {
      const res = await patientAddressService.listMine();
      const list = res.data;
      setAddresses(list);
      const previous = knownAddressIds.current;
      const added = previous ? list.find((a) => !previous.has(a.id)) : undefined;
      knownAddressIds.current = new Set(list.map((a) => a.id));
      setAddressId((current) => {
        if (added) return added.id;
        if (current && list.some((a) => a.id === current)) return current;
        return (list.find((a) => a.isDefault) ?? list[0])?.id;
      });
      list.forEach((a) => checkEligibility(a.id));
    } catch (error) {
      setAddressError(getErrorMessage(error, 'Could not load your saved addresses.'));
    } finally {
      setLoadingAddresses(false);
    }
  }, [checkEligibility]);

  useFocusEffect(
    useCallback(() => {
      if (collectionMethod === 'HOME_COLLECTION' && step === 3) loadAddresses();
    }, [collectionMethod, step, loadAddresses]),
  );

  async function handleAddDependent() {
    if (!newDependent.firstName.trim() || !newDependent.lastName.trim() || !newDependent.relation.trim()) return;
    try {
      const res = await dependentService.create(newDependent);
      setDependents((prev) => [...prev, res.data]);
      setDependentId(res.data.id);
      setShowAddDependent(false);
      setNewDependent({ firstName: '', lastName: '', relation: '' });
    } catch (error) {
      setLoadError(getErrorMessage(error, 'Could not add family member.'));
    }
  }

  async function handleSubmit() {
    if (!collectionMethod || !selectedStart || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const check = await verifySlot(dateKey, selectedStart);
      if (!check.ok) {
        returnToSlots(SLOT_TAKEN_NOTICE);
        return;
      }
      const response = await labBookingService.book({
        laboratoryId,
        laboratoryServiceIds: serviceIds,
        collectionMethod,
        scheduledAtUtc: selectedStart,
        dependentId,
        patientAddressId: collectionMethod === 'HOME_COLLECTION' ? addressId : undefined,
        notes: notes.trim() || undefined,
      });
      const next = routeAfterBooking('LAB_BOOKING', response.data.id, response.data.status);
      if (next.name === 'PaymentSummary') {
        navigation.replace('PaymentSummary', next.params);
      } else if (next.name === 'LabBookingConfirmation') {
        navigation.replace('LabBookingConfirmation', next.params);
      }
    } catch (error) {
      if ((error as NormalizedError)?.statusCode === 409) {
        returnToSlots(getErrorMessage(error, SLOT_TAKEN_NOTICE));
      } else {
        setSubmitError(getErrorMessage(error, 'Could not send this request. Please try again.'));
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (loadingLab) {
    return (
      <ScreenContainer variant="page">
        <SkeletonList count={4} />
      </ScreenContainer>
    );
  }

  if (!lab) {
    return (
      <ScreenContainer variant="page">
        <Banner variant="error" message={loadError ?? 'Lab not found.'} />
      </ScreenContainer>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === addressId);
  const selectedEligibility = addressId ? eligibility[addressId] : undefined;
  const selectedEligible = selectedEligibility?.status === 'done' && selectedEligibility.result.eligible;

  const selectedSlot = selectedStart ? slots.slots.find((slot) => slot.startAtUtc === selectedStart) ?? null : null;
  const canContinueStep1 = !!collectionMethod;
  const canContinueStep2 = !!selectedSlot && slotStatus(selectedSlot) === 'AVAILABLE';
  const canContinueStep3 = collectionMethod !== 'HOME_COLLECTION' || (!!addressId && selectedEligible);

  const stepSequence = collectionMethod === 'HOME_COLLECTION' ? [1, 3, 2, 4] : [1, 2, 4];
  const stepPosition = stepSequence.indexOf(step) + 1;

  function goToStep(direction: 1 | -1) {
    const idx = stepSequence.indexOf(step);
    const nextIdx = idx + direction;
    if (nextIdx >= 0 && nextIdx < stepSequence.length) {
      setStep(stepSequence[nextIdx]);
    }
  }

  function renderEligibilityBadge(id: string) {
    const state = eligibility[id];
    if (!state || state.status === 'checking') {
      return (
        <View style={styles.eligibilityRow}>
          <ActivityIndicator size="small" color={colors.inkFaint} />
          <Text style={styles.eligibilityChecking}>Checking availability…</Text>
        </View>
      );
    }
    if (state.status === 'error') {
      return (
        <TouchableOpacity activeOpacity={activeopacity} style={styles.eligibilityRow} onPress={() => checkEligibility(id)}>
          <Icon name="refresh" size={14} color={colors.warning} />
          <Text style={styles.eligibilityWarn}>Couldn't check. Tap to try again</Text>
        </TouchableOpacity>
      );
    }
    return state.result.eligible ? (
      <View style={styles.eligibilityRow}>
        <Icon name="checkmark-circle" size={14} color={colors.success} />
        <Text style={styles.eligibilityOk}>Home collection available</Text>
      </View>
    ) : (
      <View style={styles.eligibilityRow}>
        <Icon name="close-circle" size={14} color={colors.error} />
        <Text style={styles.eligibilityNo}>Not available at this address</Text>
      </View>
    );
  }

  const methodLabel = collectionMethod === 'HOME_COLLECTION' ? 'Home collection' : 'Lab visit';
  const footerButtons = (
    <View style={styles.footer}>
      {stepPosition > 1 && (
        <View style={styles.footerButton}>
          <Button label="Back" variant="secondary" onPress={() => goToStep(-1)} disabled={submitting} />
        </View>
      )}
      <View style={styles.footerButton}>
        {stepPosition < stepSequence.length ? (
          <Button
            label="Continue"
            onPress={() => goToStep(1)}
            disabled={step === 1 ? !canContinueStep1 : step === 2 ? !canContinueStep2 : !canContinueStep3}
          />
        ) : (
          <Button label="Confirm booking" onPress={handleSubmit} loading={submitting} disabled={submitting} />
        )}
      </View>
    </View>
  );

  const footer =
    step === 2 ? (
      <View style={styles.slotFooter}>
        <View style={styles.slotSummary} accessibilityLiveRegion="polite">
          {selectedSlot ? (
            <Text style={styles.slotSummaryTitle} numberOfLines={1}>
              {formatDay(new Date(selectedSlot.startAtUtc))} · {formatSlotTime(selectedSlot.startAtUtc)}
            </Text>
          ) : (
            <Text style={styles.slotSummaryTitleMuted}>Select a time</Text>
          )}
          <Text style={styles.slotSummaryMeta} numberOfLines={1}>
            {methodLabel} · ₹{totalAmount}
          </Text>
        </View>
        {footerButtons}
      </View>
    ) : (
      footerButtons
    );

  const selectedDate = dateWindow[Math.max(0, dateKeys.indexOf(dateKey))];
  const groups = groupSlotsByPeriod(slots.slots);
  const openCount = countOpen(slots.slots);
  const nextOpen = nextOpenDateKey(dateKeys, slots.counts, dateKey);
  const contextLine =
    collectionMethod === 'HOME_COLLECTION'
      ? selectedAddress
        ? `${selectedAddress.label} · ${formatAddress(selectedAddress)}`
        : 'At your address'
      : [lab.address, lab.locality].filter(Boolean).join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={styles.stepperWrapper}>
        <ProgressStepper currentStep={stepPosition} totalSteps={stepSequence.length} stepLabel={STEP_LABELS[step]} />
      </View>

      <ScreenContainer footer={footer} variant="page">
        {step === 1 && (
          <>
            <Text style={styles.sectionTitle}>Who is this for?</Text>
            <ChipGroup
              options={[{ label: 'Self', value: '' }, ...dependents.map((d) => ({ label: `${d.firstName} (${d.relation})`, value: d.id }))]}
              value={dependentId ?? ''}
              onChange={(v) => setDependentId((v as string) || undefined)}
            />
            {!showAddDependent ? (
              <TouchableOpacity activeOpacity={activeopacity} style={styles.addNewRow} onPress={() => setShowAddDependent(true)}>
                <Text style={{ color: colors.brand, fontWeight: '600' }}>+ Add family member</Text>
              </TouchableOpacity>
            ) : (
              <View>
                <TextField label="First name" value={newDependent.firstName} onChangeText={(v) => setNewDependent({ ...newDependent, firstName: v })} />
                <TextField label="Last name" value={newDependent.lastName} onChangeText={(v) => setNewDependent({ ...newDependent, lastName: v })} />
                <TextField label="Relation" value={newDependent.relation} onChangeText={(v) => setNewDependent({ ...newDependent, relation: v })} placeholder="e.g. Mother, Son" />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Button label="Cancel" variant="secondary" onPress={() => setShowAddDependent(false)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Add" onPress={handleAddDependent} />
                  </View>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>How would you like to get tested?</Text>
            {allowLabVisit && (
              <TouchableOpacity
                activeOpacity={activeopacity}
                style={[styles.optionCard, collectionMethod === 'LAB_VISIT' && styles.optionCardSelected]}
                onPress={() => setCollectionMethod('LAB_VISIT')}
              >
                <View>
                  <Text style={styles.optionTitle}>Visit the lab</Text>
                  <Text style={styles.optionSubtitle}>{[lab.address, lab.locality].filter(Boolean).join(', ')}</Text>
                </View>
              </TouchableOpacity>
            )}
            {allowHomeCollection && (
              <TouchableOpacity
                activeOpacity={activeopacity}
                style={[styles.optionCard, collectionMethod === 'HOME_COLLECTION' && styles.optionCardSelected]}
                onPress={() => setCollectionMethod('HOME_COLLECTION')}
              >
                <View>
                  <Text style={styles.optionTitle}>Home collection</Text>
                  <Text style={styles.optionSubtitle}>
                    {lab.homeCollectionFee ? `+₹${lab.homeCollectionFee} collection fee` : 'A collector will visit your address'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {!allowLabVisit && !allowHomeCollection && (
              <Banner variant="error" message="The selected tests don't share a common collection method at this lab." />
            )}
          </>
        )}

        {step === 2 && collectionMethod && (
          <>
            <View style={styles.contextCard}>
              <View style={styles.contextIcon}>
                <Icon name={collectionMethod === 'HOME_COLLECTION' ? 'home-outline' : 'business-outline'} size={20} color={colors.brand} />
              </View>
              <View style={styles.contextText}>
                <Text style={styles.contextTitle} numberOfLines={1}>
                  {collectionMethod === 'HOME_COLLECTION' ? `Home collection by ${lab.name}` : `Visit ${lab.name}`}
                </Text>
                <Text style={styles.contextMeta} numberOfLines={1}>
                  {selectedServices.length === 1 ? selectedServices[0].name : `${selectedServices.length} tests`}
                  {contextLine ? ` · ${contextLine}` : ''}
                </Text>
              </View>
            </View>

            <SectionHeader title="Date" meta={selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} style={styles.sectionTight} />
            <AppointmentDateStrip
              days={dateWindow}
              selectedDate={dateKey}
              onSelectDate={selectDate}
              counts={slots.counts}
              dayStatuses={slots.dayStatuses}
              countsLoaded={slots.countsLoaded}
              countsFailed={slots.countsFailed}
            />

            <SectionHeader
              title={collectionMethod === 'HOME_COLLECTION' ? `Collection time · ${formatDay(selectedDate)}` : formatDay(selectedDate)}
              meta={slots.loading || slots.error ? undefined : openCount > 0 ? `${openCount} open` : slots.dayStatus === 'FULL' ? 'Booking full' : undefined}
              style={styles.sectionTight}
            />
            <SlotLegend states={collectionMethod === 'LAB_VISIT' ? VISIT_LEGEND : HOME_LEGEND} />

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
              <EmptyCard icon="pause-circle-outline" title="Not taking bookings" description="This lab has paused new bookings. Please check back later." />
            ) : slots.slots.length === 0 ? (
              <EmptyCard
                icon="calendar-clear-outline"
                title="No slots on this day"
                description={nextOpen ? 'The lab has open times on another day.' : 'The lab has no open times in the next two weeks.'}
                actionLabel={nextOpen ? `Go to ${formatDay(dateWindow[dateKeys.indexOf(nextOpen)])}` : undefined}
                onActionPress={nextOpen ? () => selectDate(nextOpen) : undefined}
              />
            ) : (
              <Animated.View key={`${dateKey}-${collectionMethod}`} entering={fadeEntering()} style={styles.groups}>
                {groups.map((group) => {
                  const open = countOpen(group.slots);
                  return (
                    <View key={group.key} style={styles.group}>
                      <View style={styles.groupHeader}>
                        <Icon name={PERIOD_ICON[group.key]} size={16} color={colors.textSecondary} />
                        <Text style={styles.groupLabel}>{group.label}</Text>
                        <Text style={styles.groupMeta}>{open > 0 ? `${open} open` : group.slots.some(slotConsumesCapacity) ? 'Fully booked' : 'Unavailable'}</Text>
                      </View>
                      <View style={styles.grid}>
                        {group.slots.map((slot) => (
                          <SlotChip
                            key={slot.startAtUtc}
                            slot={slot}
                            width={chipWidth}
                            onPress={handleSlotPress}
                            state={resolveSlotState(slot, { selectedStart, processingStart: null, activeRequest: null })}
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
          </>
        )}

        {step === 3 && collectionMethod === 'HOME_COLLECTION' && (
          <>
            <Text style={styles.sectionTitle}>Where should we collect the sample?</Text>
            {addressError ? <Banner variant="error" message={addressError} /> : null}
            {loadingAddresses && addresses.length === 0 ? (
              <View style={{ gap: 10 }}>
                <SkeletonBlock width="100%" height={84} radius={16} />
                <SkeletonBlock width="100%" height={84} radius={16} />
              </View>
            ) : addresses.length === 0 && !addressError ? (
              <View style={styles.noAddressCard}>
                <View style={styles.noAddressIcon}>
                  <Icon name="home-outline" size={22} color={colors.primary} />
                </View>
                <Text style={styles.optionTitle}>Add your address</Text>
                <Text style={[styles.optionSubtitle, { textAlign: 'center' }]}>
                  Home collection needs an address. We'll check that {lab.name} collects there.
                </Text>
                <Button label="Add address" onPress={() => navigation.navigate('AddressEditor')} icon={<Icon name="add" size={18} color={colors.white} />} />
              </View>
            ) : (
              <>
                {addresses.map((addr) => {
                  const state = eligibility[addr.id];
                  const unavailable = state?.status === 'done' && !state.result.eligible;
                  return (
                    <TouchableOpacity
                      key={addr.id}
                      activeOpacity={activeopacity}
                      style={[styles.optionCard, addressId === addr.id && styles.optionCardSelected, unavailable && styles.optionCardMuted]}
                      onPress={() => setAddressId(addr.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.addressTitleRow}>
                          <Text style={styles.optionTitle}>{addr.label}</Text>
                          {addr.isDefault && <Text style={styles.defaultPill}>Default</Text>}
                        </View>
                        <Text style={styles.optionSubtitle} numberOfLines={2}>
                          {formatAddress(addr)}
                        </Text>
                        {renderEligibilityBadge(addr.id)}
                      </View>
                      <TouchableOpacity
                        activeOpacity={activeopacity}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        onPress={() => navigation.navigate('AddressEditor', { addressId: addr.id })}
                      >
                        <Icon name="create-outline" size={18} color={colors.inkSoft} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity activeOpacity={activeopacity} style={styles.addNewRow} onPress={() => navigation.navigate('AddressEditor')}>
                  <Text style={{ color: colors.brand, fontWeight: '600' }}>+ Add new address</Text>
                </TouchableOpacity>
                {selectedEligibility?.status === 'done' && !selectedEligibility.result.eligible ? (
                  <Banner variant="error" message={selectedEligibility.result.message} />
                ) : null}
              </>
            )}
          </>
        )}

        {step === 4 && selectedStart && (
          <>
            <Text style={styles.sectionTitle}>Review your booking</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Lab</Text>
                <Text style={styles.summaryValue}>{lab.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tests</Text>
                <Text style={styles.summaryValue}>{selectedServices.map((s) => s.name).join(', ')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Method</Text>
                <Text style={styles.summaryValue}>{collectionMethod === 'LAB_VISIT' ? 'Lab visit' : 'Home collection'}</Text>
              </View>
              {collectionMethod === 'HOME_COLLECTION' && selectedAddress ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Address</Text>
                  <Text style={styles.summaryValue}>
                    {selectedAddress.label} · {formatAddress(selectedAddress)}
                  </Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>When</Text>
                <Text style={styles.summaryValue}>
                  {new Date(selectedStart).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>₹{totalAmount}</Text>
              </View>
            </View>
            <TextField label="Notes for the lab (optional)" value={notes} onChangeText={setNotes} multiline />
            {submitError && <Banner variant="error" message={submitError} />}
          </>
        )}
      </ScreenContainer>
    </View>
  );
};

export default BookLabServiceScreen;
