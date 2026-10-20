import { useCallback, useEffect, useRef, useState } from 'react';
import { labBookingService } from '../../../services/labBookingService';
import { getErrorMessage } from '../../../utils/errors';
import type { DayAvailabilityStatus } from '../../appointments/types/appointment.types';
import { resolveDayStatus } from '../../appointments/utils/slotState';
import type { AvailableLabSlot, CollectionMethod } from '../types/labBooking.types';
import { checkSlotAvailability, type SlotCheckResult } from '../utils/labSlotState';

const POLL_MS = 30000;

interface UseLabSlotsArgs {
  laboratoryId: string;
  collectionMethod: CollectionMethod | null;
  dateKey: string;
  fromDateKey: string;
  days: number;
  enabled: boolean;
}

export function useLabSlots({ laboratoryId, collectionMethod, dateKey, fromDateKey, days, enabled }: UseLabSlotsArgs) {
  const [slots, setSlots] = useState<AvailableLabSlot[]>([]);
  const [accepting, setAccepting] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayStatus, setDayStatus] = useState<DayAvailabilityStatus | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayAvailabilityStatus>>({});
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [countsFailed, setCountsFailed] = useState(false);
  const slotSeq = useRef(0);
  const countSeq = useRef(0);

  const loadSlots = useCallback(
    async (silent = false) => {
      if (!enabled || !collectionMethod) return;
      const seq = ++slotSeq.current;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const response = await labBookingService.getAvailableSlots(laboratoryId, collectionMethod, dateKey, true);
        if (seq !== slotSeq.current) return;
        const openCount = response.data.slots.filter((slot) => (slot.status ?? 'AVAILABLE') === 'AVAILABLE').length;
        const status = response.data.dayStatus ?? resolveDayStatus({ availableCount: openCount });
        setSlots(response.data.slots);
        setAccepting(response.data.labAcceptingBookings);
        setDayStatus(status);
        setDayStatuses((current) => (current[dateKey] === status ? current : { ...current, [dateKey]: status }));
        setCounts((current) => (current[dateKey] === openCount ? current : { ...current, [dateKey]: openCount }));
        setError(null);
      } catch (err) {
        if (seq !== slotSeq.current || silent) return;
        setSlots([]);
        setDayStatus(null);
        setError(getErrorMessage(err, 'Could not load time slots.'));
      } finally {
        if (seq === slotSeq.current && !silent) setLoading(false);
      }
    },
    [laboratoryId, collectionMethod, dateKey, enabled],
  );

  const loadCounts = useCallback(async () => {
    if (!enabled || !collectionMethod) return;
    const seq = ++countSeq.current;
    try {
      const response = await labBookingService.getSlotCounts(laboratoryId, collectionMethod, fromDateKey, days);
      if (seq !== countSeq.current) return;
      const byDate: Record<string, number> = {};
      const statusByDate: Record<string, DayAvailabilityStatus> = {};
      response.data.days.forEach((day) => {
        const key = day.date.slice(0, 10);
        byDate[key] = day.availableCount;
        statusByDate[key] = resolveDayStatus(day);
      });
      setCounts(byDate);
      setDayStatuses(statusByDate);
      setCountsFailed(false);
      setCountsLoaded(true);
    } catch {
      if (seq === countSeq.current) setCountsFailed(true);
    }
  }, [laboratoryId, collectionMethod, fromDateKey, days, enabled]);

  const loadSlotsRef = useRef(loadSlots);
  const loadCountsRef = useRef(loadCounts);
  loadSlotsRef.current = loadSlots;
  loadCountsRef.current = loadCounts;

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    setCountsLoaded(false);
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    if (!enabled) return undefined;
    const poll = setInterval(() => {
      loadSlotsRef.current(true);
      loadCountsRef.current();
    }, POLL_MS);
    return () => clearInterval(poll);
  }, [enabled]);

  const refresh = useCallback(() => {
    loadSlotsRef.current(true);
    loadCountsRef.current();
  }, []);

  const verifySlot = useCallback(
    async (slotDateKey: string, startAtUtc: string): Promise<SlotCheckResult> => {
      if (!collectionMethod) return { ok: false, status: 'MISSING' };
      const response = await labBookingService.getAvailableSlots(laboratoryId, collectionMethod, slotDateKey, true);
      return checkSlotAvailability(response.data, startAtUtc);
    },
    [laboratoryId, collectionMethod],
  );

  return { slots, accepting, dayStatus, loading, error, counts, dayStatuses, countsLoaded, countsFailed, reload: loadSlots, refresh, verifySlot };
}
