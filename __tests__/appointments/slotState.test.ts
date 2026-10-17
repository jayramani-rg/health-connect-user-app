import type { AvailableSlot, BookingRequest } from '../../src/features/appointments/types/appointment.types';
import {
  clockSkewMs,
  countOpen,
  formatCountdown,
  groupSlotsByPeriod,
  isSelectable,
  mergeBookingRequest,
  newIdempotencyKey,
  nextOpenDateKey,
  queueMessage,
  remainingMs,
  resolveSlotState,
  slotAccessibilityLabel,
} from '../../src/features/appointments/utils/slotState';

const START = '2026-10-20T04:30:00Z';

function slot(overrides: Partial<AvailableSlot> = {}): AvailableSlot {
  return { startAtUtc: START, durationMinutes: 30, status: 'AVAILABLE', ...overrides };
}

function request(overrides: Partial<BookingRequest> = {}): BookingRequest {
  return {
    id: 'req-1',
    status: 'WAITING',
    statusReason: null,
    doctorProfileId: 'doc-1',
    doctorName: 'Dr. Asha Rao',
    consultationType: 'VIDEO',
    scheduledStartAtUtc: START,
    durationMinutes: 30,
    queuePosition: 2,
    appointmentId: null,
    appointmentStatus: null,
    reservationExpiresAtUtc: null,
    consultationFee: null,
    requiresPayment: false,
    createdAt: '2026-10-17T10:00:00Z',
    updatedAt: '2026-10-17T10:00:00Z',
    serverTimeUtc: '2026-10-17T10:00:01Z',
    ...overrides,
  };
}

const none = { selectedStart: null, processingStart: null, activeRequest: null };

describe('resolveSlotState', () => {
  it('maps server statuses to distinct visual states', () => {
    expect(resolveSlotState(slot(), none)).toBe('available');
    expect(resolveSlotState(slot({ status: 'RESERVED' }), none)).toBe('reserved');
    expect(resolveSlotState(slot({ status: 'BOOKED' }), none)).toBe('booked');
    expect(resolveSlotState(slot({ status: 'UNAVAILABLE', unavailableReason: 'TOO_SOON' }), none)).toBe('unavailable');
  });

  it('never lets a booked or unavailable slot appear selected', () => {
    expect(resolveSlotState(slot({ status: 'BOOKED' }), { ...none, selectedStart: START })).toBe('booked');
    expect(resolveSlotState(slot({ status: 'UNAVAILABLE' }), { ...none, selectedStart: START })).toBe('unavailable');
    expect(isSelectable(slot({ status: 'BOOKED' }))).toBe(false);
    expect(isSelectable(slot({ status: 'UNAVAILABLE' }))).toBe(false);
    expect(isSelectable(slot({ status: 'RESERVED' }))).toBe(true);
    expect(isSelectable(slot())).toBe(true);
  });

  it('marks the current user hold and queue position, and the in-flight request', () => {
    expect(resolveSlotState(slot({ status: 'RESERVED', heldByMe: true }), none)).toBe('held');
    expect(resolveSlotState(slot({ status: 'RESERVED' }), { ...none, activeRequest: request({ status: 'RESERVED' }) })).toBe('held');
    expect(resolveSlotState(slot({ status: 'RESERVED' }), { ...none, activeRequest: request() })).toBe('waiting');
    expect(resolveSlotState(slot(), { ...none, selectedStart: START, processingStart: START })).toBe('processing');
    expect(resolveSlotState(slot({ status: 'RESERVED' }), { ...none, selectedStart: START })).toBe('selected');
  });

  it('ignores finished requests when resolving ownership', () => {
    expect(resolveSlotState(slot({ status: 'RESERVED' }), { ...none, activeRequest: request({ status: 'CLOSED' }) })).toBe('reserved');
  });

  it('describes disabled states for screen readers', () => {
    expect(slotAccessibilityLabel('10:00 AM', 'booked')).toBe('10:00 AM, already booked');
    expect(slotAccessibilityLabel('10:00 AM', 'reserved', 2)).toContain('2 waiting');
  });
});

describe('groupSlotsByPeriod', () => {
  it('splits by morning, afternoon and evening in time order and drops empty groups', () => {
    const hours: Record<string, number> = { a: 9, b: 13, c: 18, d: 11 };
    const groups = groupSlotsByPeriod(
      [slot({ startAtUtc: 'c' }), slot({ startAtUtc: 'a' }), slot({ startAtUtc: 'b' }), slot({ startAtUtc: 'd' })],
      (iso) => hours[iso],
    );
    expect(groups.map((g) => g.key)).toEqual(['morning', 'afternoon', 'evening']);
    expect(groups[0].slots).toHaveLength(2);

    const morningOnly = groupSlotsByPeriod([slot({ startAtUtc: 'a' })], (iso) => hours[iso]);
    expect(morningOnly.map((g) => g.key)).toEqual(['morning']);
  });

  it('counts only bookable slots as open', () => {
    expect(countOpen([slot(), slot({ status: 'BOOKED' }), slot({ status: 'RESERVED' })])).toBe(1);
  });
});

describe('mergeBookingRequest', () => {
  it('keeps the newest state and tolerates duplicate or out of order events', () => {
    const waiting = request();
    const reserved = request({ status: 'RESERVED', updatedAt: '2026-10-17T10:00:05Z', serverTimeUtc: '2026-10-17T10:00:05Z' });

    expect(mergeBookingRequest(waiting, reserved).status).toBe('RESERVED');
    expect(mergeBookingRequest(reserved, waiting).status).toBe('RESERVED');
    expect(mergeBookingRequest(reserved, reserved)).toBe(reserved);
  });

  it('applies position updates that share the same updatedAt', () => {
    const before = request({ queuePosition: 2 });
    const after = request({ queuePosition: 1, serverTimeUtc: '2026-10-17T10:00:09Z' });
    expect(mergeBookingRequest(before, after).queuePosition).toBe(1);
    expect(mergeBookingRequest(after, before).queuePosition).toBe(1);
  });

  it('replaces the state when a different request arrives', () => {
    expect(mergeBookingRequest(request(), request({ id: 'req-2' })).id).toBe('req-2');
  });
});

describe('countdown helpers', () => {
  it('corrects for device clock skew using server time', () => {
    const receivedAt = Date.parse('2026-10-17T10:00:00Z');
    const skew = clockSkewMs('2026-10-17T10:00:30Z', receivedAt);
    expect(skew).toBe(30000);
    expect(remainingMs('2026-10-17T10:05:00Z', skew, receivedAt)).toBe(270000);
    expect(remainingMs('2026-10-17T09:00:00Z', skew, receivedAt)).toBe(0);
    expect(remainingMs(null, skew, receivedAt)).toBeNull();
  });

  it('formats minutes and seconds', () => {
    expect(formatCountdown(270000)).toBe('4:30');
    expect(formatCountdown(5000)).toBe('0:05');
    expect(formatCountdown(0)).toBe('0:00');
  });
});

describe('queue messaging and helpers', () => {
  it('tells the user when they are next, waiting further back, or offered the slot', () => {
    expect(queueMessage(request({ queuePosition: 1 })).title).toBe('You are next in line');
    expect(queueMessage(request({ queuePosition: 3 })).title).toBe('You are number 3 in line');
    expect(queueMessage(request({ status: 'RESERVED' })).tone).toBe('success');
    expect(queueMessage(request({ status: 'CLOSED', statusReason: 'SLOT_TAKEN' })).title).toBe('This slot is no longer available');
    expect(queueMessage(request({ status: 'RELEASED', statusReason: 'EXPIRED' })).title).toBe('Your reservation expired');
  });

  it('finds the next day with open slots', () => {
    const keys = ['d1', 'd2', 'd3', 'd4'];
    expect(nextOpenDateKey(keys, { d1: 0, d2: 0, d3: 4 }, 'd1')).toBe('d3');
    expect(nextOpenDateKey(keys, { d1: 2 }, 'd1')).toBeNull();
  });

  it('creates unique idempotency keys within the server limit', () => {
    const keys = new Set(Array.from({ length: 200 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(200);
    keys.forEach((key) => expect(key.length).toBeLessThanOrEqual(64));
  });
});
