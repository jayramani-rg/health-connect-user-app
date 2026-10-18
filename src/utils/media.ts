import { useCallback, useEffect, useState } from 'react';
import { ASSETS_BASE_URL } from '../config/env';

const RETRY_DELAY_MS = 1500;

export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^(https?:|file:|content:|data:)/i.test(trimmed)) return trimmed;
  return `${ASSETS_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

export function useRemoteImage(url: string | null | undefined) {
  const resolved = resolveMediaUrl(url);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
    setLoaded(false);
  }, [resolved]);

  useEffect(() => {
    if (!failed || attempt > 0 || !resolved) return undefined;
    const timer = setTimeout(() => {
      setAttempt(1);
      setFailed(false);
    }, RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [failed, attempt, resolved]);

  const onError = useCallback(() => setFailed(true), []);
  const onLoad = useCallback(() => setLoaded(true), []);

  const uri = resolved && attempt > 0 ? `${resolved}${resolved.includes('?') ? '&' : '?'}r=${attempt}` : resolved;
  const showImage = !!uri && !(failed && attempt > 0);

  return { uri, showImage, loaded, onError, onLoad };
}
