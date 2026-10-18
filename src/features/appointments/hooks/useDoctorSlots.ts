import { useCallback, useEffect, useRef, useState } from 'react';
import { availabilityService } from '../../../services/availabilityService';
import { chatSocket } from '../../../services/chatSocket';
import { getErrorMessage } from '../../../utils/errors';
import type { AvailableSlot, ConsultationType, DayAvailabilityStatus } from '../types/appointment.types';
import { resolveDayStatus } from '../utils/slotState';

const REFRESH_DEBOUNCE_MS = 250;
const OFFLINE_POLL_MS = 30000;

interface UseDoctorSlotsArgs {
  doctorProfileId: string;
  consultationType: ConsultationType | null;
  dateKey: string;
  fromDateKey: string;
  days: number;
  enabled: boolean;
}

export function useDoctorSlots({ doctorProfileId, consultationType, dateKey, fromDateKey, days, enabled }: UseDoctorSlotsArgs) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
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
      if (!enabled || !consultationType) return;
      const seq = ++slotSeq.current;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const response = await availabilityService.getAvailableSlots(doctorProfileId, consultationType, dateKey, true);
        if (seq !== slotSeq.current) return;
        setSlots(response.data.slots);
        setAccepting(response.data.doctorAcceptingAppointments);
        const openCount = response.data.slots.filter((slot) => (slot.status ?? 'AVAILABLE') === 'AVAILABLE').length;
        const status = response.data.dayStatus ?? resolveDayStatus({ availableCount: openCount });
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
    [doctorProfileId, consultationType, dateKey, enabled],
  );

  const loadCounts = useCallback(async () => {
    if (!enabled || !consultationType) return;
    const seq = ++countSeq.current;
    try {
      const response = await availabilityService.getSlotCounts(doctorProfileId, consultationType, fromDateKey, days);
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
  }, [doctorProfileId, consultationType, fromDateKey, days, enabled]);

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
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refreshSoon = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        loadSlotsRef.current(true);
        loadCountsRef.current();
      }, REFRESH_DEBOUNCE_MS);
    };

    chatSocket.watchDoctorSlots(doctorProfileId);
    const offChanged = chatSocket.onDoctorSlotsChanged((event) => {
      if (event.doctorProfileId === doctorProfileId) refreshSoon();
    });
    const offReconnected = chatSocket.onReconnected(refreshSoon);
    const poll = setInterval(() => {
      if (!chatSocket.isConnected()) refreshSoon();
    }, OFFLINE_POLL_MS);

    return () => {
      offChanged();
      offReconnected();
      clearInterval(poll);
      if (timer) clearTimeout(timer);
      chatSocket.unwatchDoctorSlots(doctorProfileId);
    };
  }, [doctorProfileId, enabled]);

  const refresh = useCallback(() => {
    loadSlotsRef.current(true);
    loadCountsRef.current();
  }, []);

  return { slots, accepting, dayStatus, loading, error, counts, dayStatuses, countsLoaded, countsFailed, reload: loadSlots, refresh };
}
