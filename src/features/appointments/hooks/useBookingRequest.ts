import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { bookingRequestService, type BookingReleaseReason } from '../../../services/bookingRequestService';
import { chatSocket } from '../../../services/chatSocket';
import { getErrorMessage } from '../../../utils/errors';
import type { BookingRequest, CreateBookingRequestPayload } from '../types/appointment.types';
import { clockSkewMs, isActiveRequest, mergeBookingRequest, newIdempotencyKey } from '../utils/slotState';

const WAITING_POLL_CONNECTED_MS = 45000;
const WAITING_POLL_OFFLINE_MS = 15000;

type SubmitPayload = Omit<CreateBookingRequestPayload, 'idempotencyKey'>;

function intentOf(payload: SubmitPayload): string {
  return `${payload.doctorProfileId}|${payload.consultationType}|${new Date(payload.scheduledStartAtUtc).getTime()}`;
}

export function useBookingRequest(doctorProfileId: string) {
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skewMs, setSkewMs] = useState(0);
  const requestRef = useRef<BookingRequest | null>(null);
  const keyRef = useRef<{ intent: string; key: string } | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const accept = useCallback((incoming: BookingRequest) => {
    if (!mounted.current) return;
    const merged = mergeBookingRequest(requestRef.current, incoming);
    requestRef.current = merged;
    setRequest(merged);
    setSkewMs(clockSkewMs(incoming.serverTimeUtc, Date.now()));
    if (!isActiveRequest(merged) && merged.status !== 'CONFIRMED') {
      keyRef.current = null;
    }
  }, []);

  const recover = useCallback(async () => {
    try {
      const response = await bookingRequestService.mine();
      const forDoctor = response.data.filter((item) => item.doctorProfileId === doctorProfileId);
      const tracked = requestRef.current ? forDoctor.find((item) => item.id === requestRef.current!.id) : undefined;
      const active = forDoctor.find(isActiveRequest);
      const next = tracked ?? active;
      if (next) accept(next);
    } catch {
    }
  }, [doctorProfileId, accept]);

  const refresh = useCallback(async () => {
    const current = requestRef.current;
    if (!current) {
      await recover();
      return;
    }
    try {
      accept((await bookingRequestService.getById(current.id)).data);
    } catch {
    }
  }, [accept, recover]);

  const recoverRef = useRef(recover);
  const refreshRef = useRef(refresh);
  recoverRef.current = recover;
  refreshRef.current = refresh;

  useEffect(() => {
    recoverRef.current();
  }, [doctorProfileId]);

  useEffect(() => {
    const offUpdated = chatSocket.onBookingRequestUpdated((incoming) => {
      if (incoming.doctorProfileId !== doctorProfileId) return;
      const current = requestRef.current;
      if (current && current.id !== incoming.id && isActiveRequest(current)) return;
      if (!current && !isActiveRequest(incoming)) return;
      accept(incoming);
    });
    const offReconnected = chatSocket.onReconnected(() => {
      refreshRef.current();
    });
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') refreshRef.current();
    });
    return () => {
      offUpdated();
      offReconnected();
      appState.remove();
    };
  }, [doctorProfileId, accept]);

  const waiting = request?.status === 'WAITING';
  useEffect(() => {
    if (!waiting) return undefined;
    let last = Date.now();
    const timer = setInterval(() => {
      const interval = chatSocket.isConnected() ? WAITING_POLL_CONNECTED_MS : WAITING_POLL_OFFLINE_MS;
      if (Date.now() - last >= interval) {
        last = Date.now();
        refreshRef.current();
      }
    }, WAITING_POLL_OFFLINE_MS);
    return () => clearInterval(timer);
  }, [waiting]);

  const submit = useCallback(
    async (payload: SubmitPayload): Promise<BookingRequest | null> => {
      const intent = intentOf(payload);
      if (!keyRef.current || keyRef.current.intent !== intent) {
        keyRef.current = { intent, key: newIdempotencyKey() };
      }
      setSubmitting(true);
      setError(null);
      try {
        const response = await bookingRequestService.create({ ...payload, idempotencyKey: keyRef.current.key });
        requestRef.current = null;
        accept(response.data);
        return response.data;
      } catch (err) {
        if (mounted.current) setError(getErrorMessage(err, 'Could not reserve this slot. Please try again.'));
        return null;
      } finally {
        if (mounted.current) setSubmitting(false);
      }
    },
    [accept],
  );

  const cancel = useCallback(
    async (reason?: BookingReleaseReason): Promise<BookingRequest | null> => {
      const current = requestRef.current;
      if (!current) return null;
      setCancelling(true);
      setError(null);
      try {
        const response = await bookingRequestService.cancel(current.id, reason);
        accept(response.data);
        return response.data;
      } catch (err) {
        if (mounted.current) setError(getErrorMessage(err, 'Could not update this request. Please try again.'));
        await refreshRef.current();
        return null;
      } finally {
        if (mounted.current) setCancelling(false);
      }
    },
    [accept],
  );

  const dismiss = useCallback(() => {
    requestRef.current = null;
    setRequest(null);
    setError(null);
  }, []);

  return { request, submitting, cancelling, error, skewMs, submit, cancel, refresh, dismiss, setError };
}
