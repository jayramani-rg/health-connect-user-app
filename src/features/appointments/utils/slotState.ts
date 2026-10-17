import type { AvailableSlot, BookingRequest, BookingRequestStatus, SlotStatus } from '../types/appointment.types';

export type SlotVisualState = 'available' | 'selected' | 'reserved' | 'booked' | 'unavailable' | 'held' | 'waiting' | 'processing';

export type SlotPeriodKey = 'morning' | 'afternoon' | 'evening';

export interface SlotGroup {
  key: SlotPeriodKey;
  label: string;
  slots: AvailableSlot[];
}

export interface SlotStateContext {
  selectedStart: string | null;
  processingStart: string | null;
  activeRequest: BookingRequest | null;
}

export type QueueTone = 'info' | 'success' | 'warning' | 'neutral';

export interface QueueMessage {
  title: string;
  body: string;
  tone: QueueTone;
}

const ACTIVE_STATUSES: BookingRequestStatus[] = ['WAITING', 'RESERVED'];

export function slotStatus(slot: AvailableSlot): SlotStatus {
  return slot.status ?? 'AVAILABLE';
}

export function isSelectable(slot: AvailableSlot): boolean {
  const status = slotStatus(slot);
  return status === 'AVAILABLE' || status === 'RESERVED';
}

export function isActiveRequest(request: BookingRequest | null | undefined): boolean {
  return !!request && ACTIVE_STATUSES.includes(request.status);
}

function sameInstant(a: string, b: string): boolean {
  return new Date(a).getTime() === new Date(b).getTime();
}

export function resolveSlotState(slot: AvailableSlot, context: SlotStateContext): SlotVisualState {
  if (context.processingStart && sameInstant(context.processingStart, slot.startAtUtc)) {
    return 'processing';
  }

  const request = context.activeRequest;
  const ownsRequest = !!request && isActiveRequest(request) && sameInstant(request.scheduledStartAtUtc, slot.startAtUtc);
  if ((ownsRequest && request?.status === 'RESERVED') || slot.heldByMe) {
    return 'held';
  }
  if ((ownsRequest && request?.status === 'WAITING') || slot.waitingByMe) {
    return 'waiting';
  }

  const status = slotStatus(slot);
  if (status === 'BOOKED') return 'booked';
  if (status === 'UNAVAILABLE') return 'unavailable';
  if (context.selectedStart && sameInstant(context.selectedStart, slot.startAtUtc)) return 'selected';
  if (status === 'RESERVED') return 'reserved';
  return 'available';
}

export function periodOf(hour: number): SlotPeriodKey {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function groupSlotsByPeriod(slots: AvailableSlot[], hourOf: (iso: string) => number = (iso) => new Date(iso).getHours()): SlotGroup[] {
  const groups: SlotGroup[] = [
    { key: 'morning', label: 'Morning', slots: [] },
    { key: 'afternoon', label: 'Afternoon', slots: [] },
    { key: 'evening', label: 'Evening', slots: [] },
  ];
  const sorted = [...slots].sort((a, b) => new Date(a.startAtUtc).getTime() - new Date(b.startAtUtc).getTime());
  sorted.forEach((slot) => {
    const key = periodOf(hourOf(slot.startAtUtc));
    groups.find((group) => group.key === key)!.slots.push(slot);
  });
  return groups.filter((group) => group.slots.length > 0);
}

export function countOpen(slots: AvailableSlot[]): number {
  return slots.filter((slot) => slotStatus(slot) === 'AVAILABLE').length;
}

export function mergeBookingRequest(current: BookingRequest | null, incoming: BookingRequest): BookingRequest {
  if (!current || current.id !== incoming.id) {
    return incoming;
  }
  const currentUpdated = new Date(current.updatedAt).getTime();
  const incomingUpdated = new Date(incoming.updatedAt).getTime();
  if (incomingUpdated !== currentUpdated) {
    return incomingUpdated > currentUpdated ? incoming : current;
  }
  return new Date(incoming.serverTimeUtc).getTime() >= new Date(current.serverTimeUtc).getTime() ? incoming : current;
}

export function clockSkewMs(serverTimeUtc: string, receivedAtLocalMs: number): number {
  return new Date(serverTimeUtc).getTime() - receivedAtLocalMs;
}

export function remainingMs(expiresAtUtc: string | null | undefined, skewMs: number, nowLocalMs: number): number | null {
  if (!expiresAtUtc) return null;
  return Math.max(0, new Date(expiresAtUtc).getTime() - (nowLocalMs + skewMs));
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function newIdempotencyKey(): string {
  const random = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${random()}-${random()}`;
}

export function nextOpenDateKey(orderedKeys: string[], counts: Record<string, number>, afterKey?: string): string | null {
  const startIndex = afterKey ? orderedKeys.indexOf(afterKey) + 1 : 0;
  for (let i = Math.max(0, startIndex); i < orderedKeys.length; i += 1) {
    if ((counts[orderedKeys[i]] ?? 0) > 0) return orderedKeys[i];
  }
  return null;
}

export function queueMessage(request: BookingRequest): QueueMessage {
  switch (request.status) {
    case 'WAITING':
      return request.queuePosition === 1
        ? {
            title: 'You are next in line',
            body: 'Another patient is completing payment for this slot. If it frees up, it is reserved for you automatically.',
            tone: 'info',
          }
        : {
            title: `You are number ${request.queuePosition ?? '–'} in line`,
            body: 'We will reserve the slot for you automatically when it is your turn. You can keep this screen open or come back later.',
            tone: 'info',
          };
    case 'RESERVED':
      return { title: 'The slot is now available for you', body: 'It is reserved in your name. Complete payment before the timer runs out.', tone: 'success' };
    case 'CONFIRMED':
      return { title: 'Appointment confirmed', body: 'Your booking has been sent to the doctor.', tone: 'success' };
    case 'CLOSED':
      if (request.statusReason === 'SLOT_UNAVAILABLE') {
        return { title: 'The doctor is not taking this slot', body: 'Their schedule changed. Please choose another time.', tone: 'warning' };
      }
      if (request.statusReason === 'SLOT_PASSED') {
        return { title: 'This time has passed', body: 'Please choose another time.', tone: 'warning' };
      }
      return { title: 'This slot is no longer available', body: 'Another patient completed their booking. Please choose another time.', tone: 'warning' };
    case 'RELEASED':
      return request.statusReason === 'EXPIRED'
        ? { title: 'Your reservation expired', body: 'Payment was not completed in time, so the slot was released.', tone: 'warning' }
        : { title: 'Slot released', body: 'Your reserved slot was released.', tone: 'neutral' };
    case 'LEFT':
    default:
      return { title: 'You left the queue', body: 'Pick any available time to continue.', tone: 'neutral' };
  }
}

export function slotStateLabel(state: SlotVisualState): string | null {
  switch (state) {
    case 'reserved':
      return 'Held';
    case 'booked':
      return 'Booked';
    case 'unavailable':
      return 'Unavailable';
    case 'held':
      return 'Your hold';
    case 'waiting':
      return 'In queue';
    case 'processing':
      return 'Reserving';
    default:
      return null;
  }
}

export function slotAccessibilityLabel(timeLabel: string, state: SlotVisualState, queueLength = 0): string {
  switch (state) {
    case 'selected':
      return `${timeLabel}, selected`;
    case 'reserved':
      return queueLength > 0
        ? `${timeLabel}, held by another patient, ${queueLength} waiting. Select to join the queue`
        : `${timeLabel}, held by another patient. Select to join the queue`;
    case 'booked':
      return `${timeLabel}, already booked`;
    case 'unavailable':
      return `${timeLabel}, not available for booking`;
    case 'held':
      return `${timeLabel}, reserved for you`;
    case 'waiting':
      return `${timeLabel}, you are in the queue`;
    case 'processing':
      return `${timeLabel}, reserving`;
    default:
      return `${timeLabel}, available`;
  }
}
