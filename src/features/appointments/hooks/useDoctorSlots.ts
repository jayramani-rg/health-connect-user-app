import { useCallback, useEffect, useRef, useState } from 'react';
import { availabilityService } from '../../../services/availabilityService';
import { chatSocket } from '../../../services/chatSocket';
import { getErrorMessage } from '../../../utils/errors';
import type { AvailableSlot, ConsultationType } from '../types/appointment.types';

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
  const [counts, setCounts] = useState<Record<string, number>>({});
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
        setError(null);
      } catch (err) {
        if (seq !== slotSeq.current || silent) return;
        setSlots([]);
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
      response.data.days.forEach((day) => {
        byDate[day.date.slice(0, 10)] = day.availableCount;
      });
      setCounts(byDate);
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

  return { slots, accepting, loading, error, counts, countsLoaded, countsFailed, reload: loadSlots, refresh };
}
