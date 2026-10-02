import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Banner } from '../Banner/Banner';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import { LocationMapPreview } from '../LocationMapPreview/LocationMapPreview';
import { TextField } from '../TextField/TextField';
import { colors } from '../../theme';
import {
  formatLocalityLabel,
  geocodeAddress,
  isLocationLookupConfigured,
  LocationLookupError,
  type ResolvedLocation,
} from '../../services/googleLocationService';
import { isAddressLocationStale } from '../../utils/addressLocation';
import { styles } from './styles/AddressLocationForm.styles';
import type { AddressLocationFormProps } from './types/AddressLocationForm.types';

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.readOnlyField}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <Text style={[styles.readOnlyValue, !value && styles.readOnlyValueEmpty]} numberOfLines={2}>
        {value || 'Not available'}
      </Text>
    </View>
  );
}

export function AddressLocationForm({
  value,
  onChange,
  addressLabel = 'Address line',
  addressPlaceholder = 'House / building, street, area',
  mapHeight = 190,
  footerAction,
  disabled = false,
}: AddressLocationFormProps) {
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ResolvedLocation[]>([]);

  const stale = isAddressLocationStale(value);
  const resolved = value.resolved;
  const lookupAvailable = isLocationLookupConfigured();

  function select(candidate: ResolvedLocation) {
    onChange({ ...value, resolved: candidate, resolvedFor: value.addressLine.trim(), manualPincode: candidate.pincode ? '' : value.manualPincode });
  }

  async function handleFind() {
    if (searching || disabled) return;
    const query = value.addressLine.trim();
    if (query.length < 3) {
      setLookupError('Enter a little more of the address first.');
      return;
    }
    setSearching(true);
    setLookupError(null);
    try {
      const results = await geocodeAddress(query);
      setCandidates(results);
      if (results.length === 0) {
        setLookupError("We couldn't find this address. Try adding the area, city or a nearby landmark.");
        return;
      }
      select(results[0]);
    } catch (error) {
      setCandidates([]);
      setLookupError(error instanceof LocationLookupError ? error.message : 'Could not look up this address. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  const localityLabel = resolved ? formatLocalityLabel(resolved) : null;

  return (
    <View style={styles.container}>
      <LocationMapPreview
        latitude={resolved && !stale ? resolved.latitude : null}
        longitude={resolved && !stale ? resolved.longitude : null}
        caption={localityLabel ?? resolved?.googleAddress}
        height={mapHeight}
        loading={searching}
      />

      <TextField
        label={addressLabel}
        value={value.addressLine}
        onChangeText={(text) => onChange({ ...value, addressLine: text })}
        placeholder={addressPlaceholder}
        editable={!disabled}
        multiline
        autoCapitalize="words"
      />

      {lookupAvailable ? (
        <Button
          label={resolved && !stale ? 'Find again on map' : 'Find on map'}
          variant={resolved && !stale ? 'secondary' : 'primary'}
          onPress={handleFind}
          loading={searching}
          disabled={disabled || value.addressLine.trim().length < 3}
          icon={<Icon name="search" size={16} color={resolved && !stale ? colors.primary : colors.white} />}
        />
      ) : (
        <Banner variant="warning" message="Address lookup is unavailable right now. Please try again later." />
      )}

      {footerAction}

      {stale ? <Banner variant="warning" message='You edited the address — tap "Find on map" again to update the pin.' /> : null}
      {lookupError ? <Banner variant="error" message={lookupError} /> : null}

      {candidates.length > 1 && !stale ? (
        <View style={styles.candidates}>
          <Text style={styles.candidatesTitle}>Did you mean</Text>
          {candidates.map((candidate) => {
            const selected = resolved?.latitude === candidate.latitude && resolved?.longitude === candidate.longitude;
            return (
              <TouchableOpacity
                key={`${candidate.latitude},${candidate.longitude}`}
                activeOpacity={0.8}
                style={[styles.candidateRow, selected && styles.candidateRowSelected]}
                onPress={() => select(candidate)}
              >
                <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={18} color={selected ? colors.primary : colors.inkFaint} />
                <Text style={styles.candidateText} numberOfLines={2}>
                  {candidate.googleAddress}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {resolved && !stale ? (
        <View style={styles.resolvedCard}>
          <View style={styles.resolvedHeader}>
            <View style={styles.verifiedPill}>
              <Icon name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.verifiedText}>Confirmed with Google Maps</Text>
            </View>
            <Icon name="lock-closed-outline" size={14} color={colors.inkFaint} />
          </View>
          <Text style={styles.googleAddress}>{resolved.googleAddress}</Text>
          <View style={styles.grid}>
            <ReadOnlyField label="Locality" value={resolved.locality} />
            <ReadOnlyField label="City" value={resolved.city} />
          </View>
          <View style={styles.grid}>
            <ReadOnlyField label="State" value={resolved.state} />
            {resolved.pincode ? (
              <ReadOnlyField label="Pincode" value={resolved.pincode} />
            ) : (
              <View style={styles.manualField}>
                <TextField
                  label="Pincode"
                  value={value.manualPincode}
                  onChangeText={(text) => onChange({ ...value, manualPincode: text.replace(/[^0-9]/g, '').slice(0, 6) })}
                  placeholder="6 digits"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!disabled}
                />
              </View>
            )}
          </View>
          {!resolved.pincode ? (
            <Text style={styles.note}>Google didn't return a pincode for this address — please enter it.</Text>
          ) : null}
          {!resolved.locality ? (
            <Text style={styles.note}>No locality found for this address — the city will be used for nearby matching.</Text>
          ) : null}
          <Text style={styles.footnote}>These details come from Google Maps and can't be edited. To change them, edit the address line and find it again.</Text>
        </View>
      ) : null}
    </View>
  );
}

export type { AddressLocationFormProps };
