import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { DateStrip } from '../../../components/DateStrip/DateStrip';
import { Icon } from '../../../components/Icon/Icon';
import { ProgressStepper } from '../../../components/ProgressStepper/ProgressStepper';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonBlock, SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import { TextField } from '../../../components/TextField/TextField';
import { colors } from '../../../theme';
import { activeopacity, toLocalDateKey } from '../../../utils/helpers';
import { labService } from '../../../services/labService';
import { labBookingService } from '../../../services/labBookingService';
import { dependentService } from '../../../services/dependentService';
import { patientAddressService } from '../../../services/patientAddressService';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabDetail } from '../../labs/types/lab.types';
import type { Dependent, PatientAddress } from '../../patients/types/patient.types';
import type { AvailableLabSlot, CollectionMethod, HomeCollectionEligibility } from '../types/labBooking.types';
import { styles } from '../styles/BookLabServiceScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'BookLabService'>;

const STEP_LABELS: Record<number, string> = { 1: 'Patient & method', 2: 'Date & time', 3: 'Collection address', 4: 'Review' };

type EligibilityState = { status: 'checking' } | { status: 'done'; result: HomeCollectionEligibility } | { status: 'error'; message: string };

function todayKey(): string {
  return toLocalDateKey(new Date());
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

  const [dateKey, setDateKey] = useState(todayKey());
  const [slots, setSlots] = useState<AvailableLabSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableLabSlot | null>(null);

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
        setLoadError(error instanceof Error ? error.message : 'Could not load booking details.');
      } finally {
        setLoadingLab(false);
      }
    })();
  }, [laboratoryId]);

  const selectedServices = useMemo(() => lab?.services.filter((s) => serviceIds.includes(s.id)) ?? [], [lab, serviceIds]);

  const allowLabVisit = selectedServices.length > 0 && selectedServices.every((s) => s.labVisitEnabled);
  const allowHomeCollection = (lab?.homeCollectionEnabled ?? false) && selectedServices.length > 0 && selectedServices.every((s) => s.homeCollectionEnabled);

  const totalAmount = selectedServices.reduce((sum, s) => sum + (s.discountPrice ?? s.price), 0) + (collectionMethod === 'HOME_COLLECTION' ? lab?.homeCollectionFee ?? 0 : 0);

  const loadSlots = useCallback(async () => {
    if (!collectionMethod) return;
    setLoadingSlots(true);
    setSlotsMessage(null);
    setSelectedSlot(null);
    try {
      const response = await labBookingService.getAvailableSlots(laboratoryId, collectionMethod, dateKey);
      setSlots(response.data.slots);
      if (response.data.slots.length === 0) setSlotsMessage(response.message || 'No slots available on this day.');
    } catch (error) {
      setSlots([]);
      setSlotsMessage(error instanceof Error ? error.message : 'Could not load available slots.');
    } finally {
      setLoadingSlots(false);
    }
  }, [laboratoryId, collectionMethod, dateKey]);

  useEffect(() => {
    if (step === 2) loadSlots();
  }, [step, loadSlots]);

  const checkEligibility = useCallback(
    async (id: string) => {
      setEligibility((prev) => ({ ...prev, [id]: { status: 'checking' } }));
      try {
        const res = await labBookingService.checkHomeCollectionEligibility(laboratoryId, id);
        setEligibility((prev) => ({ ...prev, [id]: { status: 'done', result: res.data } }));
      } catch (error) {
        setEligibility((prev) => ({
          ...prev,
          [id]: { status: 'error', message: error instanceof Error ? error.message : "Couldn't check this address." },
        }));
      }
    },
    [laboratoryId],
  );

  // Refetch on every focus so an address added/edited in AddressEditor (pushed on top of this screen) shows up;
  // a newly created one is auto-selected. Each address is checked against the lab's pincode whitelist by the
  // backend — the same rule the booking request itself enforces.
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
      setAddressError(error instanceof Error ? error.message : 'Could not load your saved addresses.');
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
      setLoadError(error instanceof Error ? error.message : 'Could not add family member.');
    }
  }

  async function handleSubmit() {
    if (!collectionMethod || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await labBookingService.book({
        laboratoryId,
        laboratoryServiceIds: serviceIds,
        collectionMethod,
        scheduledAtUtc: selectedSlot.startAtUtc,
        dependentId,
        patientAddressId: collectionMethod === 'HOME_COLLECTION' ? addressId : undefined,
        notes: notes.trim() || undefined,
      });
      navigation.replace('LabBookingConfirmation', { bookingId: response.data.id });
    } catch (error) {
      // The backend is the final authority (pincode whitelist, address ownership, slot capacity) — show its reason.
      setSubmitError(error instanceof Error ? error.message : 'Could not send this request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingLab) {
    return (
      <ScreenContainer>
        <SkeletonList count={4} />
      </ScreenContainer>
    );
  }

  if (!lab) {
    return (
      <ScreenContainer>
        <Banner variant="error" message={loadError ?? 'Lab not found.'} />
      </ScreenContainer>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === addressId);
  const selectedEligibility = addressId ? eligibility[addressId] : undefined;
  const selectedEligible = selectedEligibility?.status === 'done' && selectedEligibility.result.eligible;

  const canContinueStep1 = !!collectionMethod;
  const canContinueStep2 = !!selectedSlot;
  const canContinueStep3 = collectionMethod !== 'HOME_COLLECTION' || (!!addressId && selectedEligible);

  // Home collection confirms the address (and that the lab collects there) BEFORE a slot is picked, so nobody
  // chooses a time only to learn the address isn't serviceable. Lab visits skip the address step entirely.
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
          <Text style={styles.eligibilityWarn}>Couldn't check — tap to retry</Text>
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={styles.stepperWrapper}>
        <ProgressStepper currentStep={stepPosition} totalSteps={stepSequence.length} stepLabel={STEP_LABELS[step]} />
      </View>

      <ScreenContainer>
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

        {step === 4 && selectedSlot && (
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
                  {new Date(selectedSlot.startAtUtc).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
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
            <Button label="Confirm booking" onPress={handleSubmit} loading={submitting} />
          )}
        </View>
      </View>
    </View>
  );
};

export default BookLabServiceScreen;
