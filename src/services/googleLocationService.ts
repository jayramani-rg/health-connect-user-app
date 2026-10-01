// Google Maps Platform helpers: forward geocoding (typed address → structured location), reverse geocoding
// (device coordinates → locality) and Static Maps preview URLs. The key comes from .env via config/env —
// never hardcoded. Every failure becomes a typed LocationLookupError so screens can show a specific,
// friendly message instead of crashing; nothing here throws anything else.

import { GOOGLE_API_KEY } from '../config/env';

export interface ResolvedLocation {
  /** Google's formatted_address. */
  googleAddress: string;
  /** Neighbourhood-level area, e.g. "Prahlad Nagar". Null when Google has none for this place. */
  locality: string | null;
  city: string | null;
  state: string | null;
  /** 6-digit pincode, or null when Google returned no postal code. */
  pincode: string | null;
  latitude: number;
  longitude: number;
}

export type LocationLookupErrorCode = 'NOT_CONFIGURED' | 'NETWORK' | 'TIMEOUT' | 'NOT_FOUND' | 'DENIED' | 'QUOTA' | 'UNKNOWN';

export class LocationLookupError extends Error {
  code: LocationLookupErrorCode;

  constructor(code: LocationLookupErrorCode, message: string) {
    super(message);
    this.name = 'LocationLookupError';
    this.code = code;
  }
}

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const STATIC_MAP_URL = 'https://maps.googleapis.com/maps/api/staticmap';
const LOOKUP_TIMEOUT_MS = 12000;

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodeResult {
  formatted_address: string;
  address_components: GoogleAddressComponent[];
  geometry: { location: { lat: number; lng: number } };
  types: string[];
}

interface GoogleGeocodeResponse {
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
  results: GoogleGeocodeResult[];
  error_message?: string;
}

export function isLocationLookupConfigured(): boolean {
  return GOOGLE_API_KEY.length > 0;
}

function pick(components: GoogleAddressComponent[], ...types: string[]): string | null {
  for (const type of types) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.long_name;
  }
  return null;
}

/** Maps Google's address_components onto our model. Locality prefers the most specific named area
 * (sublocality → neighbourhood); City prefers Google's "locality" (the town/city), falling back to the
 * district. A "locality" that merely repeats the city is dropped — it adds no ranking signal. */
export function parseGeocodeResult(result: GoogleGeocodeResult): ResolvedLocation {
  const c = result.address_components;
  const city = pick(c, 'locality', 'administrative_area_level_3', 'administrative_area_level_2');
  let locality = pick(c, 'sublocality_level_1', 'sublocality', 'neighborhood', 'sublocality_level_2');
  if (locality && city && locality.trim().toLowerCase() === city.trim().toLowerCase()) {
    locality = null;
  }
  const rawPincode = pick(c, 'postal_code');
  const pincode = rawPincode && /^[1-9]\d{5}$/.test(rawPincode.replace(/\s/g, '')) ? rawPincode.replace(/\s/g, '') : null;

  return {
    googleAddress: result.formatted_address,
    locality,
    city,
    state: pick(c, 'administrative_area_level_1'),
    pincode,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
  };
}

async function requestGeocode(params: Record<string, string>): Promise<GoogleGeocodeResult[]> {
  if (!isLocationLookupConfigured()) {
    throw new LocationLookupError('NOT_CONFIGURED', 'Address lookup is not available right now.');
  }

  const query = new URLSearchParams({ ...params, key: GOOGLE_API_KEY, region: 'in', language: 'en' }).toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${GEOCODE_URL}?${query}`, { signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new LocationLookupError('TIMEOUT', 'Finding this address took too long. Please try again.');
    }
    throw new LocationLookupError('NETWORK', 'No internet connection. Check your network and try again.');
  } finally {
    clearTimeout(timeout);
  }

  let payload: GoogleGeocodeResponse;
  try {
    payload = (await response.json()) as GoogleGeocodeResponse;
  } catch {
    throw new LocationLookupError('UNKNOWN', 'Could not look up this address. Please try again.');
  }

  switch (payload.status) {
    case 'OK':
      return payload.results;
    case 'ZERO_RESULTS':
      return [];
    case 'OVER_DAILY_LIMIT':
    case 'OVER_QUERY_LIMIT':
      throw new LocationLookupError('QUOTA', 'Address lookup is busy right now. Please try again in a moment.');
    case 'REQUEST_DENIED':
      throw new LocationLookupError('DENIED', 'Address lookup is not available right now.');
    default:
      throw new LocationLookupError('UNKNOWN', 'Could not look up this address. Please try again.');
  }
}

/** Typed address → up to 5 candidate places in India, best match first. An empty array means "not found". */
export async function geocodeAddress(address: string): Promise<ResolvedLocation[]> {
  const trimmed = address.trim();
  if (trimmed.length < 3) return [];
  const results = await requestGeocode({ address: trimmed, components: 'country:IN' });
  return results.slice(0, 5).map(parseGeocodeResult);
}

/** Device coordinates → the most specific address Google has for them, or null. */
export async function reverseGeocode(latitude: number, longitude: number): Promise<ResolvedLocation | null> {
  const results = await requestGeocode({ latlng: `${latitude},${longitude}` });
  if (results.length === 0) return null;
  // Merge the first few results so a street-level first hit still yields a sublocality/postal code that
  // only appears on a broader result.
  const parsed = results.slice(0, 4).map(parseGeocodeResult);
  const best = parsed[0];
  return {
    ...best,
    locality: best.locality ?? parsed.find((p) => p.locality)?.locality ?? null,
    city: best.city ?? parsed.find((p) => p.city)?.city ?? null,
    state: best.state ?? parsed.find((p) => p.state)?.state ?? null,
    pincode: best.pincode ?? parsed.find((p) => p.pincode)?.pincode ?? null,
  };
}

/** A branded Google Static Maps image URL centred on the point, or null when no key is configured. */
export function staticMapUrl(latitude: number, longitude: number, options: { width: number; height: number; zoom?: number }): string | null {
  if (!isLocationLookupConfigured()) return null;
  const width = Math.min(640, Math.max(1, Math.round(options.width)));
  const height = Math.min(640, Math.max(1, Math.round(options.height)));
  const params = [
    `center=${latitude},${longitude}`,
    `zoom=${options.zoom ?? 16}`,
    `size=${width}x${height}`,
    'scale=2',
    'maptype=roadmap',
    // Soft, low-noise basemap so the brand-coloured pin is the focal point.
    'style=feature:poi|element:labels|visibility:off',
    'style=feature:poi.business|visibility:off',
    'style=feature:transit|element:labels.icon|visibility:off',
    'style=feature:water|element:geometry|color:0xcfe7ec',
    'style=feature:landscape|element:geometry|color:0xf4f2ee',
    'style=feature:road|element:geometry|color:0xffffff',
    `markers=color:0x0E6E64|${latitude},${longitude}`,
    `key=${encodeURIComponent(GOOGLE_API_KEY)}`,
  ];
  return `${STATIC_MAP_URL}?${params.join('&')}`;
}

/** "Prahlad Nagar, Ahmedabad" — the locality-level label the app shows users. */
export function formatLocalityLabel(location: { locality?: string | null; city?: string | null }): string | null {
  const parts = [location.locality, location.city].filter((p): p is string => !!p && p.trim().length > 0);
  return parts.length > 0 ? parts.join(', ') : null;
}
