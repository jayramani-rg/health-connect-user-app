import type { ResolvedLocation } from '../services/googleLocationService';

export interface AddressLocationValue {
  addressLine: string;
  resolved: ResolvedLocation | null;
  resolvedFor: string | null;
  manualPincode: string;
}

export interface SavedLocationFields {
  address?: string | null;
  googleAddress?: string | null;
  locality?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface LocationPayload {
  addressLine: string;
  googleAddress: string;
  locality: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

const PINCODE_PATTERN = /^[1-9]\d{5}$/;

export function emptyAddressLocation(addressLine = ''): AddressLocationValue {
  return { addressLine, resolved: null, resolvedFor: null, manualPincode: '' };
}

export function addressLocationFromSaved(saved: SavedLocationFields | null | undefined): AddressLocationValue {
  if (!saved) return emptyAddressLocation();
  const addressLine = saved.address ?? '';
  if (saved.latitude == null || saved.longitude == null) {
    return emptyAddressLocation(addressLine);
  }
  return {
    addressLine,
    resolvedFor: addressLine.trim(),
    manualPincode: '',
    resolved: {
      googleAddress: saved.googleAddress ?? addressLine,
      locality: saved.locality ?? null,
      city: saved.city ?? null,
      state: saved.state ?? null,
      pincode: saved.pincode ?? null,
      latitude: saved.latitude,
      longitude: saved.longitude,
    },
  };
}

export function isAddressLocationStale(value: AddressLocationValue): boolean {
  return !!value.resolved && value.resolvedFor !== value.addressLine.trim();
}

export function effectivePincode(value: AddressLocationValue): string {
  return value.resolved?.pincode ?? value.manualPincode.trim();
}

export function addressLocationProblem(value: AddressLocationValue): string | null {
  if (value.addressLine.trim().length < 3) return 'Enter your address.';
  if (!value.resolved) return 'Tap "Find on map" to confirm the address.';
  if (isAddressLocationStale(value)) return 'You edited the address — tap "Find on map" again to confirm it.';
  if (!value.resolved.city || !value.resolved.state) return 'Google could not identify the city for this address. Try adding the area and city.';
  if (!PINCODE_PATTERN.test(effectivePincode(value))) return 'Enter a valid 6-digit pincode.';
  return null;
}

export function toLocationPayload(value: AddressLocationValue): LocationPayload | null {
  if (addressLocationProblem(value) || !value.resolved) return null;
  const r = value.resolved;
  return {
    addressLine: value.addressLine.trim(),
    googleAddress: r.googleAddress,
    locality: r.locality,
    city: r.city as string,
    state: r.state as string,
    pincode: effectivePincode(value),
    latitude: r.latitude,
    longitude: r.longitude,
  };
}
