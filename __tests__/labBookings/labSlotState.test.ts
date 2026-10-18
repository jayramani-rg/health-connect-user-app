import { labDayMessage } from '../../src/features/labBookings/utils/labSlotState';

describe('labDayMessage', () => {
  it('reports a paused lab', () => {
    expect(labDayMessage({ labAcceptingBookings: false, dayStatus: 'NO_SLOTS', slots: [] })).toBe('This lab is not taking bookings right now.');
  });

  it('separates a fully booked day from a day without slots', () => {
    expect(labDayMessage({ labAcceptingBookings: true, dayStatus: 'FULL', slots: [] })).toBe('Booking full on this day. Please choose another date.');
    expect(labDayMessage({ labAcceptingBookings: true, dayStatus: 'NO_SLOTS', slots: [] })).toBe('No slots on this day.');
    expect(labDayMessage({ labAcceptingBookings: true, slots: [] })).toBe('No slots on this day.');
  });

  it('returns nothing when slots are open', () => {
    expect(labDayMessage({ labAcceptingBookings: true, dayStatus: 'AVAILABLE', slots: [{ startAtUtc: '2026-10-20T04:30:00Z' }] })).toBeNull();
  });
});
