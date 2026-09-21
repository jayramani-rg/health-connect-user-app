import ReactNativeBlobUtil from 'react-native-blob-util';
import { API_BASE_URL } from '../config/env';

/**
 * Fetches a protected file (e.g. a lab report) as a base64 data URI, using a Bearer token — RN's `Image`
 * component can render a data URI directly, so this needs no native file-system/share library. Only
 * suitable for content small enough to hold in memory as base64 (fine for report images).
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

/**
 * Downloads a protected file (e.g. a PDF report) to a local cache path, using a Bearer token —
 * react-native-pdf renders from a local file path, not from an authenticated URL it can't attach headers
 * to itself. Returns the local file:// path.
 */
export async function downloadToLocalFile(path: string, token: string | null, fileName: string): Promise<string> {
  const target = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;
  const response = await ReactNativeBlobUtil.config({ path: target }).fetch('GET', `${API_BASE_URL}${path}`, {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const status = response.info().status;
  if (status < 200 || status >= 300) {
    throw new Error(`Could not load file (${status}).`);
  }

  return `file://${response.path()}`;
}
