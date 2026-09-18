import { API_BASE_URL } from '../config/env';

/**
 * Fetches a protected file (e.g. a lab report) as a base64 data URI, using a Bearer token — RN's `Image`
 * component can render a data URI directly, so this needs no native file-system/share library. Only
 * suitable for content small enough to hold in memory as base64 (fine for the photographed report images
 * this app currently produces; a real PDF viewer would need a dedicated library, see report screen notes).
 */
export async function fetchAsDataUri(path: string, token: string | null): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Could not load file (${response.status}).`);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the downloaded file.'));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
