import { formatRupees } from '../../src/features/payments/utils/paymentFormat';
import { routeAfterBooking } from '../../src/features/payments/utils/routeAfterBooking';

describe('formatRupees', () => {
  it.each([
    [1030, '₹1,030.00'],
    [0, '₹0.00'],
    [930.5, '₹930.50'],
    [100000, '₹1,00,000.00'],
    [12345678.9, '₹1,23,45,678.90'],
    [999.999, '₹1,000.00'],
    [-71.28, '-₹71.28'],
  ])('formats %p as %p', (value, expected) => {
    expect(formatRupees(value)).toBe(expected);
  });
});

describe('routeAfterBooking', () => {
  it('sends an unpaid appointment to the payment summary', () => {
    expect(routeAfterBooking('APPOINTMENT', 'a1', 'PAYMENT_PENDING')).toEqual({
      name: 'PaymentSummary',
      params: { kind: 'APPOINTMENT', bookingId: 'a1' },
    });
  });

  it('sends an unpaid lab booking to the payment summary', () => {
    expect(routeAfterBooking('LAB_BOOKING', 'b1', 'PAYMENT_PENDING')).toEqual({
      name: 'PaymentSummary',
      params: { kind: 'LAB_BOOKING', bookingId: 'b1' },
    });
  });

  it('keeps the existing confirmation flow when payment is not required', () => {
    expect(routeAfterBooking('APPOINTMENT', 'a1', 'PENDING')).toEqual({ name: 'AppointmentConfirmation', params: { appointmentId: 'a1' } });
    expect(routeAfterBooking('LAB_BOOKING', 'b1', 'PENDING')).toEqual({ name: 'LabBookingConfirmation', params: { bookingId: 'b1' } });
  });
});
