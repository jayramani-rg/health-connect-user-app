import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { bookingRequestService, type BookingReleaseReason } from '../../../services/bookingRequestService';
import { chatSocket } from '../../../services/chatSocket';
import { getErrorMessage } from '../../../utils/errors';
import type { BookingRequest } from '../../appointments/types/appointment.types';
import { clockSkewMs, mergeBookingRequest } from '../../appointments/utils/slotState';
import type { PaymentBookingKind } from '../types/payment.types';

export type ReleaseOutcome = 'released' | 'confirmed' | 'held' | 'failed';

export function useReservationHold(kind: PaymentBookingKind, bookingId: string) {
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [skewMs, setSkewMs] = useState(0);
  const [releasing, setReleasing] = useState(false);
  const requestRef = useRef<BookingRequest | null>(null);
  const enabled = kind === 'APPOINTMENT';

  const accept = useCallback((incoming: BookingRequest) => {
    const merged = mergeBookingRequest(requestRef.current, incoming);
    requestRef.current = merged;
    setRequest(merged);
    setSkewMs(clockSkewMs(incoming.serverTimeUtc, Date.now()));
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const current = requestRef.current;
      if (current) {
        accept((await bookingRequestService.getById(current.id)).data);
        return;
      }
      const mine = await bookingRequestService.mine();
      const match = mine.data.find((item) => item.appointmentId === bookingId);
      if (match) accept(match);
    } catch {
    }
  }, [enabled, bookingId, accept]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return undefined;
    const offUpdated = chatSocket.onBookingRequestUpdated((incoming) => {
      if (incoming.appointmentId === bookingId || incoming.id === requestRef.current?.id) accept(incoming);
    });
    const offReconnected = chatSocket.onReconnected(refresh);
    const appState = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => {
      offUpdated();
      offReconnected();
      appState.remove();
    };
  }, [enabled, bookingId, accept, refresh]);

  const release = useCallback(
    async (reason: BookingReleaseReason): Promise<{ outcome: ReleaseOutcome; message?: string }> => {
      const current = requestRef.current;
      if (!current) return { outcome: 'failed', message: 'This booking could not be found.' };
      setReleasing(true);
      try {
        const response = await bookingRequestService.cancel(current.id, reason);
        accept(response.data);
        if (response.data.status === 'CONFIRMED') return { outcome: 'confirmed' };
        if (response.data.status === 'RELEASED') return { outcome: 'released' };
        return { outcome: 'held' };
      } catch (error) {
        await refresh();
        return { outcome: 'held', message: getErrorMessage(error, 'We could not release the slot yet. It is still held for you.') };
      } finally {
        setReleasing(false);
      }
    },
    [accept, refresh],
  );

  return { request, skewMs, releasing, refresh, release };
}
