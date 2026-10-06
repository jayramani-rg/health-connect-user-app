import { API } from '../api';
import type { ApiResponse } from '../types/common.types';
import type { PaymentBookingKind, PaymentOrder, PaymentQuote, PaymentResult } from '../features/payments/types/payment.types';

function bookingBody(kind: PaymentBookingKind, bookingId: string): { appointmentId?: string; labBookingId?: string } {
  return kind === 'APPOINTMENT' ? { appointmentId: bookingId } : { labBookingId: bookingId };
}

export const paymentService = {
  quote: (kind: PaymentBookingKind, bookingId: string): Promise<ApiResponse<PaymentQuote>> =>
    API.request<PaymentQuote>('/payments/quote', { method: 'POST', body: bookingBody(kind, bookingId) }),

  createOrder: (kind: PaymentBookingKind, bookingId: string): Promise<ApiResponse<PaymentOrder>> =>
    API.request<PaymentOrder>('/payments/orders', { method: 'POST', body: bookingBody(kind, bookingId) }),

  verify: (paymentId: string): Promise<ApiResponse<PaymentResult>> =>
    API.request<PaymentResult>('/payments/verify', { method: 'POST', body: { paymentId } }),
};
