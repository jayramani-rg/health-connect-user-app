import ReactNativeBlobUtil from 'react-native-blob-util';
import { API_BASE_URL } from '../config/env';

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
