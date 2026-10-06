export type PaymentBookingKind = 'APPOINTMENT' | 'LAB_BOOKING';

export type CashfreeEnvironmentName = 'SANDBOX' | 'PRODUCTION';

export interface PaymentQuote {
  bookingType: PaymentBookingKind;
  bookingId: string;
  providerName: string;
  title: string;
  serviceAmount: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  customerPayableAmount: number;
  currency: string;
  paymentWindowMinutes: number;
}

export interface PaymentOrder {
  paymentId: string;
  cashfreeOrderId: string;
  paymentSessionId: string;
  environment: CashfreeEnvironmentName;
  amount: number;
  currency: string;
  serviceAmount: number;
  platformFeeAmount: number;
  customerPayableAmount: number;
  description: string;
}

export interface PaymentResult {
  paymentId: string;
  status: string;
  bookingType: PaymentBookingKind;
  bookingId: string;
  customerPayableAmount: number;
  paidAt: string | null;
}

export type CheckoutOutcome = { status: 'completed' } | { status: 'cancelled' } | { status: 'failed'; message: string };
