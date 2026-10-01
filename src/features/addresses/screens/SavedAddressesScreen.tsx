import React, { useCallback, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { Icon } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonBlock } from '../../../components/SkeletonLoader/SkeletonLoader';
import { colors } from '../../../theme';
import { activeopacity } from '../../../utils/helpers';
import { patientAddressService } from '../../../services/patientAddressService';
import { useAppDispatch, useAppSelector, clearLocality } from '../../../store';
import type { RootStackParamList } from '../../../navigation/types';
import type { PatientAddress } from '../../patients/types/patient.types';
import { styles } from '../styles/Addresses.styles';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedAddresses'>;

function iconFor(label: string) {
  const l = label.toLowerCase();
  if (l === 'work') return 'briefcase-outline' as const;
  if (l === 'parents') return 'people-outline' as const;
  if (l === 'home') return 'home-outline' as const;
  return 'location-outline' as const;
}

const SavedAddressesScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const selectedAddressId = useAppSelector((state) => (state.locationData.source === 'address' ? state.locationData.addressId : null));
  const [addresses, setAddresses] = useState<PatientAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await patientAddressService.listMine();
      setAddresses(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your addresses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function makeDefault(address: PatientAddress) {
    setBusyId(address.id);
    try {
      await patientAddressService.update(address.id, {
        label: address.label,
        line1: address.line1,
        line2: address.line2 ?? undefined,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        googleAddress: address.googleAddress ?? undefined,
        locality: address.locality,
        latitude: address.latitude ?? undefined,
        longitude: address.longitude ?? undefined,
        isDefault: true,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this address.');
    } finally {
      setBusyId(null);
    }
  }

  function confirmDelete(address: PatientAddress) {
    Alert.alert('Remove address?', `"${address.label}" will be removed. Past bookings keep the address they were made with.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setBusyId(address.id);
          try {
            await patientAddressService.remove(address.id);
            if (selectedAddressId === address.id) dispatch(clearLocality());
            await load();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not remove this address.');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <ScreenContainer>
        {error ? <Banner variant="error" message={error} /> : null}
        {loading ? (
          <View style={styles.skeletonStack}>
            <SkeletonBlock width="100%" height={110} radius={16} />
            <SkeletonBlock width="100%" height={110} radius={16} />
          </View>
        ) : addresses.length === 0 ? (
          <EmptyState title="No saved addresses" description="Add an address to book home sample collection." />
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Icon name={iconFor(address.label)} size={16} color={colors.primary} />
                </View>
                <Text style={styles.cardTitle}>{address.label}</Text>
                {address.isDefault && <Text style={styles.defaultPill}>Default</Text>}
              </View>
              <Text style={styles.cardText}>
                {[address.line1, address.line2].filter(Boolean).join(', ')}
              </Text>
              <Text style={styles.cardText}>
                {[address.locality, address.city, address.state].filter(Boolean).join(', ')} · {address.pincode}
              </Text>
              {address.latitude == null && <Text style={styles.legacyNote}>Confirm this address on the map for accurate home collection.</Text>}
              <View style={styles.cardActions}>
                <TouchableOpacity activeOpacity={activeopacity} onPress={() => navigation.navigate('AddressEditor', { addressId: address.id })} disabled={busyId === address.id}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                {!address.isDefault && (
                  <TouchableOpacity activeOpacity={activeopacity} onPress={() => makeDefault(address)} disabled={busyId === address.id}>
                    <Text style={styles.actionText}>Set as default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity activeOpacity={activeopacity} onPress={() => confirmDelete(address)} disabled={busyId === address.id}>
                  <Text style={styles.actionTextDanger}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScreenContainer>
      <View style={styles.footer}>
        <Button label="Add new address" onPress={() => navigation.navigate('AddressEditor')} icon={<Icon name="add" size={18} color={colors.white} />} />
      </View>
    </View>
  );
};

export default SavedAddressesScreen;
