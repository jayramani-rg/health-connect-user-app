import type { PaymentBookingKind } from '../types/payment.types';

export type PostBookingRoute =
  | { name: 'PaymentSummary'; params: { kind: PaymentBookingKind; bookingId: string } }
  | { name: 'AppointmentConfirmation'; params: { appointmentId: string } }
  | { name: 'LabBookingConfirmation'; params: { bookingId: string } };

export function routeAfterBooking(kind: PaymentBookingKind, bookingId: string, status: string): PostBookingRoute {
  if (status === 'PAYMENT_PENDING') {
    return { name: 'PaymentSummary', params: { kind, bookingId } };
  }

  return kind === 'APPOINTMENT'
    ? { name: 'AppointmentConfirmation', params: { appointmentId: bookingId } }
    : { name: 'LabBookingConfirmation', params: { bookingId } };
}
