import React, { useCallback, useState } from 'react';
import { Linking, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { Icon } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonBlock } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { patientAddressService } from '../../../services/patientAddressService';
import { formatLocalityLabel } from '../../../services/googleLocationService';
import type { RootStackParamList } from '../../../navigation/types';
import type { PatientAddress } from '../../patients/types/patient.types';
import { outcomeMessage, useUserLocality } from '../hooks/useUserLocality';
import { styles } from '../styles/Location.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectLocation'>;

const SelectLocationScreen: React.FC<Props> = ({ navigation }) => {
  const { label, location, detecting, enableAndDetect, selectSavedAddress } = useUserLocality();
  const [addresses, setAddresses] = useState<PatientAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      patientAddressService
        .listMine()
        .then((res) => active && setAddresses(res.data))
        .catch(() => active && setAddresses([]))
        .finally(() => active && setLoadingAddresses(false));
      return () => {
        active = false;
      };
    }, []),
  );

  async function handleUseCurrent() {
    setMessage(null);
    setShowSettings(false);
    const outcome = await enableAndDetect();
    if (outcome.status === 'ok') {
      navigation.goBack();
      return;
    }
    setMessage(outcomeMessage(outcome));
    setShowSettings(outcome.status === 'blocked');
  }

  function handlePickAddress(address: PatientAddress) {
    selectSavedAddress(address);
    navigation.goBack();
  }

  return (
    <ScreenContainer>
      <View style={styles.currentCard}>
        <View style={styles.currentIcon}>
          <Icon name="navigate" size={18} color={colors.primary} />
        </View>
        <View style={styles.flex1}>
          <Text style={styles.overline}>Your area</Text>
          <Text style={styles.currentLabel}>{label ?? 'Not set'}</Text>
          <Text style={styles.currentHint}>
            {label
              ? location.source === 'address'
                ? 'From a saved address'
                : 'From your current location'
              : 'Doctors and labs near you will be shown first.'}
          </Text>
        </View>
      </View>

      <Button
        label="Use my current location"
        onPress={handleUseCurrent}
        loading={detecting}
        icon={<Icon name="locate" size={16} color={colors.white} />}
      />
      <Text style={styles.privacyNote}>We only use your approximate area — your exact location is never stored.</Text>

      {message ? <Banner variant="info" message={message} /> : null}
      {showSettings ? <Button label="Open settings" variant="secondary" onPress={() => Linking.openSettings()} /> : null}

      <Text style={styles.sectionTitle}>Saved addresses</Text>
      {loadingAddresses ? (
        <View style={styles.skeletonStack}>
          <SkeletonBlock width="100%" height={64} radius={16} />
          <SkeletonBlock width="100%" height={64} radius={16} />
        </View>
      ) : addresses.length === 0 ? (
        <Text style={styles.emptyText}>No saved addresses yet.</Text>
      ) : (
        addresses.map((address) => {
          const selected = location.source === 'address' && location.addressId === address.id;
          return (
            <TouchableOpacity
              key={address.id}
              activeOpacity={activeopacity}
              style={[styles.addressRow, selected && styles.addressRowSelected]}
              onPress={() => handlePickAddress(address)}
            >
              <Icon name={address.label.toLowerCase() === 'work' ? 'briefcase-outline' : 'home-outline'} size={18} color={colors.primary} />
              <View style={styles.flex1}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                <Text style={styles.addressLine} numberOfLines={1}>
                  {formatLocalityLabel(address) ?? `${address.city} ${address.pincode}`}
                </Text>
              </View>
              {selected && <Icon name="checkmark-circle" size={18} color={colors.primary} />}
            </TouchableOpacity>
          );
        })
      )}

      <TouchableOpacity activeOpacity={activeopacity} style={styles.linkRow} onPress={() => navigation.navigate('AddressEditor')}>
        <Icon name="add-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.linkText}>Add a new address</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
};

export default SelectLocationScreen;
