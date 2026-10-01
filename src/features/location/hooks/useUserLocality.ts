// Everything the UI needs about the user's locality, with all the "location is optional" rules in one place:
//  • we show our own soft prompt once (Home), and only trigger the OS dialog when the user taps "Enable";
//  • once granted, the locality is refreshed silently at most every 30 minutes — no watchers, no background;
//  • a locality the user explicitly picked from a saved address is never overridden by the device;
//  • with no permission, the default saved address's locality is used if there is one;
//  • nothing here throws or blocks — failure just means "no personalization yet".

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
      return 'Location is turned off for HealthConnect. You can enable it in your phone settings, or pick a saved address instead.';
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

  /** The explicit user action ("Enable location" / "Use current location"). */
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

  /** Silent, launch-time upkeep. Never prompts. */
  const refreshQuietly = useCallback(async () => {
    const stale = !location.updatedAt || Date.now() - location.updatedAt > REFRESH_AFTER_MS;

    if (location.permission === 'granted' && location.source !== 'address' && stale) {
      // Android: the user may have revoked permission in Settings since last time.
      if (Platform.OS === 'android' && !(await checkLocationPermission())) {
        dispatch(setLocationPermission('denied'));
      } else {
        const outcome = await detectCurrentLocality();
        applyDeviceOutcome(outcome);
        if (outcome.status === 'ok') return;
      }
    }

    // No usable device locality — fall back to the default saved address, if any.
    if (!location.city && !location.locality) {
      try {
        const response = await patientAddressService.listMine();
        const fallback = response.data.find((a) => a.isDefault) ?? response.data[0];
        if (fallback) selectSavedAddress(fallback);
      } catch {
        // Offline or not a patient profile yet — personalization just stays off.
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
