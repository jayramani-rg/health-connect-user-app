import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Switch, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddressLocationForm } from '../../../components/AddressLocationForm/AddressLocationForm';
import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { ChipGroup } from '../../../components/ChipGroup/ChipGroup';
import { Icon } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { TextField } from '../../../components/TextField/TextField';
import { colors } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { patientAddressService } from '../../../services/patientAddressService';
import { detectCurrentLocality, requestLocationPermission } from '../../../services/deviceLocationService';
import {
  addressLocationFromSaved,
  addressLocationProblem,
  emptyAddressLocation,
  toLocationPayload,
  type AddressLocationValue,
} from '../../../utils/addressLocation';
import { outcomeMessage } from '../../location/hooks/useUserLocality';
import type { RootStackParamList } from '../../../navigation/types';
import { styles } from '../styles/Addresses.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'AddressEditor'>;

const LABELS = ['Home', 'Work', 'Parents', 'Other'];

const AddressEditorScreen: React.FC<Props> = ({ route, navigation }) => {
  const addressId = route.params?.addressId;
  const [loading, setLoading] = useState(!!addressId);
  const [labelChoice, setLabelChoice] = useState('Home');
  const [customLabel, setCustomLabel] = useState('');
  const [line2, setLine2] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [location, setLocation] = useState<AddressLocationValue>(emptyAddressLocation());
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: addressId ? 'Edit address' : 'Add address' });
    if (!addressId) return;
    patientAddressService
      .listMine()
      .then((res) => {
        const existing = res.data.find((a) => a.id === addressId);
        if (!existing) {
          setError('This address no longer exists.');
          return;
        }
        const isPreset = LABELS.includes(existing.label);
        setLabelChoice(isPreset ? existing.label : 'Other');
        setCustomLabel(isPreset ? '' : existing.label);
        setLine2(existing.line2 ?? '');
        setIsDefault(existing.isDefault);
        setLocation(addressLocationFromSaved({ ...existing, address: existing.line1 }));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this address.'))
      .finally(() => setLoading(false));
  }, [addressId, navigation]);

  async function handleUseCurrentLocation() {
    setNotice(null);
    setLocating(true);
    try {
      const permission = await requestLocationPermission();
      if (permission !== 'granted') {
        setNotice(outcomeMessage({ status: permission }));
        return;
      }
      const outcome = await detectCurrentLocality();
      if (outcome.status !== 'ok') {
        setNotice(outcomeMessage(outcome));
        return;
      }
      const line = outcome.location.googleAddress;
      setLocation({ addressLine: line, resolved: outcome.location, resolvedFor: line.trim(), manualPincode: '' });
      setNotice('Location found. Add your flat / house number below so the collector can find you.');
    } finally {
      setLocating(false);
    }
  }

  const label = labelChoice === 'Other' ? customLabel.trim() || 'Other' : labelChoice;
  const problem = addressLocationProblem(location);

  async function handleSave() {
    const payload = toLocationPayload(location);
    if (!payload || saving) {
      setError(problem ?? 'Please complete the address.');
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      label,
      line1: payload.addressLine,
      line2: line2.trim() || undefined,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      googleAddress: payload.googleAddress,
      locality: payload.locality,
      latitude: payload.latitude,
      longitude: payload.longitude,
      isDefault,
    };
    try {
      if (addressId) {
        await patientAddressService.update(addressId, body);
      } else {
        await patientAddressService.create(body);
      }
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this address. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer scroll={false} style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer>
        <AddressLocationForm
          value={location}
          onChange={(next) => {
            setLocation(next);
            setError(null);
          }}
          addressLabel="Address"
          addressPlaceholder="e.g. 12 Shivalik Apartments, Prahlad Nagar"
          mapHeight={210}
          footerAction={
            <TouchableOpacity activeOpacity={activeopacity} style={styles.inlineAction} onPress={handleUseCurrentLocation} disabled={locating}>
              {locating ? <ActivityIndicator size="small" color={colors.primary} /> : <Icon name="locate" size={16} color={colors.primary} />}
              <Text style={styles.inlineActionText}>Use my current location</Text>
            </TouchableOpacity>
          }
        />
        {notice ? <Banner variant="info" message={notice} /> : null}

        <View style={styles.section}>
          <TextField label="Flat, floor or landmark (optional)" value={line2} onChangeText={setLine2} placeholder="e.g. Flat 402, near City Gold" />
          <Text style={styles.sectionTitle}>Save as</Text>
          <ChipGroup options={LABELS.map((l) => ({ label: l, value: l }))} value={labelChoice} onChange={(v) => setLabelChoice(v as string)} />
          {labelChoice === 'Other' ? (
            <TextField label="Label" value={customLabel} onChangeText={setCustomLabel} placeholder="e.g. Grandma's place" maxLength={50} />
          ) : null}
          <View style={styles.toggleRow}>
            <View style={styles.flex1}>
              <Text style={styles.toggleLabel}>Default address</Text>
              <Text style={styles.toggleHint}>Pre-selected for home collection.</Text>
            </View>
            <Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        {error ? <Banner variant="error" message={error} /> : null}
      </ScreenContainer>
      <View style={styles.footer}>
        <Button label={addressId ? 'Save changes' : 'Save address'} onPress={handleSave} loading={saving} disabled={!!problem} />
      </View>
    </View>
  );
};

export default AddressEditorScreen;
