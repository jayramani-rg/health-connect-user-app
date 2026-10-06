import type { CheckoutOutcome } from '../types/payment.types';

interface CheckoutErrorShape {
  getMessage?: () => string;
  getCode?: () => string;
  getType?: () => string;
  message?: string;
  code?: string | number;
  type?: string;
  status?: string;
}

const CANCEL_PATTERN = /cancel|user[_ ]?dropped|dropped|back[_ ]?pressed|closed/i;
const GENERIC_FAILURE = 'The payment could not be completed. Please try again.';

function read(error: CheckoutErrorShape) {
  const message = error.getMessage?.() ?? error.message ?? '';
  const code = error.getCode?.() ?? (error.code === undefined ? '' : String(error.code));
  const type = error.getType?.() ?? error.type ?? '';
  return { message, code, type };
}

export function classifyCheckoutError(error: unknown): CheckoutOutcome {
  if (typeof error !== 'object' || error === null) {
    return { status: 'failed', message: GENERIC_FAILURE };
  }

  const { message, code, type } = read(error as CheckoutErrorShape);

  if (CANCEL_PATTERN.test(code) || CANCEL_PATTERN.test(type) || CANCEL_PATTERN.test(message)) {
    return { status: 'cancelled' };
  }

  return { status: 'failed', message: message || GENERIC_FAILURE };
}
