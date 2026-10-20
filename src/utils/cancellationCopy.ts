export type CancellationSubject = 'appointment' | 'labBooking';

const PROVIDER: Record<CancellationSubject, string> = {
  appointment: 'doctor',
  labBooking: 'lab',
};

const NOUN: Record<CancellationSubject, string> = {
  appointment: 'appointment',
  labBooking: 'booking',
};

export function cancellationMessage(subject: CancellationSubject, status: string): string {
  const provider = PROVIDER[subject];
  const noun = NOUN[subject];
  if (status === 'PAYMENT_PENDING') {
    return `Your held slot will be released. If any amount was charged for this ${noun}, it will be refunded in full.`;
  }
  if (status === 'PENDING') {
    return `The ${provider} has not accepted this ${noun} yet, so any amount you paid online will be refunded in full.`;
  }
  return `The ${provider} has already accepted this ${noun}. Any refund of an online payment follows the cancellation policy, and a cancellation charge may apply.`;
}
