import { useEffect, useState } from 'react';

export function useCallDuration(startedAtMs: number | null): number {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (startedAtMs === null) {
      setSeconds(0);
      return undefined;
    }

    const update = () => setSeconds(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startedAtMs]);

  return seconds;
}
