import { useEffect, useState } from 'react';
import { remainingMs } from '../utils/slotState';

export function useCountdown(expiresAtUtc: string | null | undefined, skewMs: number): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAtUtc) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAtUtc]);

  return remainingMs(expiresAtUtc, skewMs, now);
}
