import type { SlotStatus } from '../../appointments/types/appointment.types';
import type { AvailableLabSlotsResponse } from '../types/labBooking.types';

export type SlotCheckResult = { ok: true } | { ok: false; status: SlotStatus | 'MISSING' };

export function checkSlotAvailability(response: Pick<AvailableLabSlotsResponse, 'labAcceptingBookings' | 'slots'>, startAtUtc: string): SlotCheckResult {
  const target = new Date(startAtUtc).getTime();
  const match = response.slots.find((slot) => new Date(slot.startAtUtc).getTime() === target);
  if (!response.labAcceptingBookings || !match) return { ok: false, status: 'MISSING' };
  const status = match.status ?? 'AVAILABLE';
  return status === 'AVAILABLE' ? { ok: true } : { ok: false, status };
}
