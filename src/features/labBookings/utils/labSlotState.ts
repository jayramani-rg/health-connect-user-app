import type { AvailableLabSlotsResponse } from '../types/labBooking.types';

export function labDayMessage(response: Pick<AvailableLabSlotsResponse, 'labAcceptingBookings' | 'dayStatus' | 'slots'>): string | null {
  if (!response.labAcceptingBookings) return 'This lab is not taking bookings right now.';
  if (response.slots.length > 0) return null;
  if (response.dayStatus === 'FULL') return 'Booking full on this day. Please choose another date.';
  return 'No slots on this day.';
}
