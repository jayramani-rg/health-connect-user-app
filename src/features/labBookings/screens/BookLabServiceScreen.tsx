import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { DateStrip } from '../../../components/DateStrip/DateStrip';
import { ProgressStepper } from '../../../components/ProgressStepper/ProgressStepper';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
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
import type { AvailableLabSlot, CollectionMethod } from '../types/labBooking.types';
import { styles } from '../styles/BookLabServiceScreen.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'BookLabService'>;

const STEP_LABELS: Record<number, string> = { 1: 'Patient & method', 2: 'Date & time', 3: 'Address', 4: 'Review' };

function todayKey(): string {
  return toLocalDateKey(new Date());
}

const BookLabServiceScreen: React.FC<Props> = ({ route, navigation }) => {
  const { laboratoryId, serviceIds } = route.params;

  const [lab, setLab] = useState<LabDetail | null>(null);
  const [loadingLab, setLoadingLab] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [addresses, setAddresses] = useState<PatientAddress[]>([]);

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

  const [addressId, setAddressId] = useState<string | undefined>(undefined);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', line1: '', city: '', state: '', pincode: '' });

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

  useEffect(() => {
    if (step === 3 && collectionMethod === 'HOME_COLLECTION' && addresses.length === 0) {
      patientAddressService
        .listMine()
        .then((res) => {
          setAddresses(res.data);
          const def = res.data.find((a) => a.isDefault);
          if (def) setAddressId(def.id);
        })
        .catch(() => {});
    }
  }, [step, collectionMethod, addresses.length]);

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

  async function handleAddAddress() {
    if (!newAddress.line1.trim() || !newAddress.city.trim() || !newAddress.state.trim() || !newAddress.pincode.trim()) return;
    try {
      const res = await patientAddressService.create({ ...newAddress, isDefault: addresses.length === 0 });
      setAddresses((prev) => [...prev, res.data]);
      setAddressId(res.data.id);
      setShowAddAddress(false);
      setNewAddress({ label: '', line1: '', city: '', state: '', pincode: '' });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not add address.');
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
      setSubmitError(error instanceof Error ? error.message : 'Could not send this request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingLab) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!lab) {
    return (
      <ScreenContainer>
        <Banner variant="error" message={loadError ?? 'Lab not found.'} />
      </ScreenContainer>
    );
  }

  const canContinueStep1 = !!collectionMethod;
  const canContinueStep2 = !!selectedSlot;
  const canContinueStep3 = collectionMethod !== 'HOME_COLLECTION' || !!addressId;

  // Address (step 3) only exists for home collection — skip it in both directions otherwise, rather than
  // landing on a blank screen when navigating Back from Review.
  const stepSequence = collectionMethod === 'HOME_COLLECTION' ? [1, 2, 3, 4] : [1, 2, 4];
  const stepPosition = stepSequence.indexOf(step) + 1;

  function goToStep(direction: 1 | -1) {
    const idx = stepSequence.indexOf(step);
    const nextIdx = idx + direction;
    if (nextIdx >= 0 && nextIdx < stepSequence.length) {
      setStep(stepSequence[nextIdx]);
    }
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
                  <Text style={styles.optionSubtitle}>{lab.address}</Text>
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
            <Text style={styles.sectionTitle}>Collection address</Text>
            {addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                activeOpacity={activeopacity}
                style={[styles.optionCard, addressId === addr.id && styles.optionCardSelected]}
                onPress={() => setAddressId(addr.id)}
              >
                <View>
                  <Text style={styles.optionTitle}>{addr.label}</Text>
                  <Text style={styles.optionSubtitle}>
                    {addr.line1}, {addr.city}, {addr.state} {addr.pincode}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {!showAddAddress ? (
              <TouchableOpacity activeOpacity={activeopacity} style={styles.addNewRow} onPress={() => setShowAddAddress(true)}>
                <Text style={{ color: colors.brand, fontWeight: '600' }}>+ Add new address</Text>
              </TouchableOpacity>
            ) : (
              <View>
                <TextField label="Label" value={newAddress.label} onChangeText={(v) => setNewAddress({ ...newAddress, label: v })} placeholder="Home, Work" />
                <TextField label="Address line" value={newAddress.line1} onChangeText={(v) => setNewAddress({ ...newAddress, line1: v })} />
                <TextField label="City" value={newAddress.city} onChangeText={(v) => setNewAddress({ ...newAddress, city: v })} />
                <TextField label="State" value={newAddress.state} onChangeText={(v) => setNewAddress({ ...newAddress, state: v })} />
                <TextField label="Pincode" value={newAddress.pincode} onChangeText={(v) => setNewAddress({ ...newAddress, pincode: v })} keyboardType="numeric" />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Button label="Cancel" variant="secondary" onPress={() => setShowAddAddress(false)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Add" onPress={handleAddAddress} />
                  </View>
                </View>
              </View>
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
