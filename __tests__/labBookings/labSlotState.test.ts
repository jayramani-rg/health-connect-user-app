import { checkSlotAvailability } from '../../src/features/labBookings/utils/labSlotState';
import type { AvailableLabSlot } from '../../src/features/labBookings/types/labBooking.types';

const NINE = '2026-10-20T03:30:00Z';
const NINE_THIRTY = '2026-10-20T04:00:00Z';

function slot(startAtUtc: string, status?: AvailableLabSlot['status']): AvailableLabSlot {
  return { startAtUtc, durationMinutes: 30, status };
}

describe('checkSlotAvailability', () => {
  it('accepts a slot that is still open, matching the instant not the string', () => {
    expect(checkSlotAvailability({ labAcceptingBookings: true, slots: [slot('2026-10-20T03:30:00.000Z', 'AVAILABLE')] }, NINE)).toEqual({ ok: true });
    expect(checkSlotAvailability({ labAcceptingBookings: true, slots: [slot(NINE)] }, NINE)).toEqual({ ok: true });
  });

  it('rejects a slot that was booked in the meantime', () => {
    expect(checkSlotAvailability({ labAcceptingBookings: true, slots: [slot(NINE, 'BOOKED'), slot(NINE_THIRTY)] }, NINE)).toEqual({ ok: false, status: 'BOOKED' });
  });

  it('rejects a slot that moved inside the notice window', () => {
    expect(checkSlotAvailability({ labAcceptingBookings: true, slots: [slot(NINE, 'UNAVAILABLE')] }, NINE)).toEqual({ ok: false, status: 'UNAVAILABLE' });
  });

  it('rejects a slot that no longer exists or a lab that paused bookings', () => {
    expect(checkSlotAvailability({ labAcceptingBookings: true, slots: [slot(NINE_THIRTY)] }, NINE)).toEqual({ ok: false, status: 'MISSING' });
    expect(checkSlotAvailability({ labAcceptingBookings: false, slots: [slot(NINE)] }, NINE)).toEqual({ ok: false, status: 'MISSING' });
  });
});
