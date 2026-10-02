import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useAppDispatch, useAppSelector, setLocality, setLocationPermission, markLocationPrompted } from '../../../store';
import { checkLocationPermission, detectCurrentLocality, requestLocationPermission, type DeviceLocationOutcome } from '../../../services/deviceLocationService';
import { formatLocalityLabel } from '../../../services/googleLocationService';
import { patientAddressService } from '../../../services/patientAddressService';
import type { PatientAddress } from '../../patients/types/patient.types';

const REFRESH_AFTER_MS = 30 * 60 * 1000;

export interface NearParams {
  nearLocality?: string;
  nearCity?: string;
}

export function outcomeMessage(outcome: DeviceLocationOutcome): string | null {
  switch (outcome.status) {
    case 'ok':
      return null;
    case 'denied':
      return 'Location permission was not granted. You can still browse all doctors and labs.';
    case 'blocked':
      return 'Location is turned off for Carova. You can enable it in your phone settings, or pick a saved address instead.';
    case 'services_off':
      return "Your phone's location services seem to be off. Turn them on, or pick a saved address instead.";
    case 'timeout':
      return "We couldn't get your location in time. Please try again.";
    case 'lookup_failed':
      return outcome.message;
  }
}

export function useUserLocality() {
  const dispatch = useAppDispatch();
  const location = useAppSelector((state) => state.locationData);
  const [detecting, setDetecting] = useState(false);

  const label = formatLocalityLabel(location);

  const nearParams = useMemo<NearParams>(
    () => ({ nearLocality: location.locality ?? undefined, nearCity: location.city ?? undefined }),
    [location.locality, location.city],
  );

  const shouldShowPrompt = location.promptedAt === null && location.permission === 'unknown' && !location.city && !location.locality;

  const applyDeviceOutcome = useCallback(
    (outcome: DeviceLocationOutcome) => {
      if (outcome.status === 'ok') {
        const { locality, city, state, pincode } = outcome.location;
        dispatch(setLocality({ locality, city, state, pincode, source: 'device' }));
        dispatch(setLocationPermission('granted'));
      } else if (outcome.status === 'denied') {
        dispatch(setLocationPermission('denied'));
      } else if (outcome.status === 'services_off') {
        dispatch(setLocationPermission('unavailable'));
      }
    },
    [dispatch],
  );

  const enableAndDetect = useCallback(async (): Promise<DeviceLocationOutcome> => {
    dispatch(markLocationPrompted());
    setDetecting(true);
    try {
      const permission = await requestLocationPermission();
      if (permission !== 'granted') {
        dispatch(setLocationPermission(permission));
        return { status: permission };
      }
      dispatch(setLocationPermission('granted'));
      const outcome = await detectCurrentLocality();
      applyDeviceOutcome(outcome);
      return outcome;
    } finally {
      setDetecting(false);
    }
  }, [dispatch, applyDeviceOutcome]);

  const dismissPrompt = useCallback(() => {
    dispatch(markLocationPrompted());
  }, [dispatch]);

  const selectSavedAddress = useCallback(
    (address: PatientAddress) => {
      dispatch(
        setLocality({ locality: address.locality, city: address.city, state: address.state, pincode: address.pincode, source: 'address', addressId: address.id }),
      );
    },
    [dispatch],
  );

  const refreshQuietly = useCallback(async () => {
    const stale = !location.updatedAt || Date.now() - location.updatedAt > REFRESH_AFTER_MS;

    if (location.permission === 'granted' && location.source !== 'address' && stale) {
      if (Platform.OS === 'android' && !(await checkLocationPermission())) {
        dispatch(setLocationPermission('denied'));
      } else {
        const outcome = await detectCurrentLocality();
        applyDeviceOutcome(outcome);
        if (outcome.status === 'ok') return;
      }
    }

    if (!location.city && !location.locality) {
      try {
        const response = await patientAddressService.listMine();
        const fallback = response.data.find((a) => a.isDefault) ?? response.data[0];
        if (fallback) selectSavedAddress(fallback);
      } catch {
      }
    }
  }, [location.permission, location.source, location.updatedAt, location.city, location.locality, dispatch, applyDeviceOutcome, selectSavedAddress]);

  return {
    location,
    label,
    nearParams,
    hasLocality: !!(location.city || location.locality),
    detecting,
    shouldShowPrompt,
    enableAndDetect,
    dismissPrompt,
    selectSavedAddress,
    refreshQuietly,
  };
}
