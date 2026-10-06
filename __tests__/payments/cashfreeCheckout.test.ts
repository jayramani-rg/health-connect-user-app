import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import { openCheckout } from '../../src/features/payments/cashfree/CashfreeCheckout';
import type { PaymentOrder } from '../../src/features/payments/types/payment.types';
import { classifyCheckoutError } from '../../src/features/payments/utils/checkoutError';

const order: PaymentOrder = {
  paymentId: 'pay-1',
  cashfreeOrderId: 'HC123',
  paymentSessionId: 'session_abc',
  environment: 'SANDBOX',
  amount: 1030,
  currency: 'INR',
  serviceAmount: 1000,
  platformFeeAmount: 30,
  customerPayableAmount: 1030,
  description: 'Consultation',
};

function errorResponse(code: string, message: string, type = 'request_failed') {
  return {
    getCode: () => code,
    getMessage: () => message,
    getType: () => type,
    getStatus: () => 'FAILED',
  };
}

const service = CFPaymentGatewayService as unknown as {
  setCallback: jest.Mock;
  removeCallback: jest.Mock;
  doWebPayment: jest.Mock;
};

beforeEach(() => {
  service.setCallback.mockReset();
  service.removeCallback.mockReset();
  service.doWebPayment.mockReset();
});

describe('classifyCheckoutError', () => {
  it('reads the getters of a Cashfree error response', () => {
    expect(classifyCheckoutError(errorResponse('payment_failed', 'Card declined by bank'))).toEqual({
      status: 'failed',
      message: 'Card declined by bank',
    });
  });

  it.each([
    ['payment_cancelled', 'x', 'request_failed'],
    ['x', 'User cancelled the payment', 'request_failed'],
    ['x', 'x', 'user_dropped'],
    ['x', 'Payment dropped by the user', 'x'],
  ])('treats %p / %p / %p as a cancellation', (code, message, type) => {
    expect(classifyCheckoutError(errorResponse(code, message, type))).toEqual({ status: 'cancelled' });
  });

  it('reads plain objects', () => {
    expect(classifyCheckoutError({ code: 'network_error', message: 'Network error' })).toEqual({ status: 'failed', message: 'Network error' });
    expect(classifyCheckoutError({ code: 5, message: 'Cancelled' })).toEqual({ status: 'cancelled' });
  });

  it('falls back to a generic message for unknown shapes', () => {
    expect(classifyCheckoutError(undefined).status).toBe('failed');
    expect(classifyCheckoutError('boom').status).toBe('failed');
    expect(classifyCheckoutError({})).toEqual({ status: 'failed', message: 'The payment could not be completed. Please try again.' });
  });
});

describe('openCheckout', () => {
  it('starts a web checkout with the session issued by the backend', () => {
    openCheckout(order);

    expect(service.setCallback).toHaveBeenCalledTimes(1);
    expect(service.doWebPayment).toHaveBeenCalledTimes(1);

    const session = service.doWebPayment.mock.calls[0][0] as CFSession;
    expect(session).toBeInstanceOf(CFSession);
    expect(session.payment_session_id).toBe('session_abc');
    expect(session.orderID).toBe('HC123');
    expect(session.environment).toBe(CFEnvironment.SANDBOX);
  });

  it('uses the production environment when the backend says so', () => {
    openCheckout({ ...order, environment: 'PRODUCTION' });

    const session = service.doWebPayment.mock.calls[0][0] as CFSession;
    expect(session.environment).toBe(CFEnvironment.PRODUCTION);
  });

  it('completes when the SDK reports a verifiable payment and detaches its callback', async () => {
    const pending = openCheckout(order);
    service.setCallback.mock.calls[0][0].onVerify('HC123');

    await expect(pending).resolves.toEqual({ status: 'completed' });
    expect(service.removeCallback).toHaveBeenCalledTimes(1);
  });

  it('reports a cancelled checkout', async () => {
    const pending = openCheckout(order);
    service.setCallback.mock.calls[0][0].onError(errorResponse('payment_cancelled', 'Cancelled'), 'HC123');

    await expect(pending).resolves.toEqual({ status: 'cancelled' });
  });

  it('reports a failed checkout with the gateway message', async () => {
    const pending = openCheckout(order);
    service.setCallback.mock.calls[0][0].onError(errorResponse('payment_failed', 'Insufficient funds'), 'HC123');

    await expect(pending).resolves.toEqual({ status: 'failed', message: 'Insufficient funds' });
  });

  it('settles only once even if the SDK calls back twice', async () => {
    const pending = openCheckout(order);
    const callback = service.setCallback.mock.calls[0][0];
    callback.onVerify('HC123');
    callback.onError(errorResponse('payment_failed', 'late'), 'HC123');

    await expect(pending).resolves.toEqual({ status: 'completed' });
    expect(service.removeCallback).toHaveBeenCalledTimes(1);
  });

  it('turns a native module failure into a failed outcome', async () => {
    service.doWebPayment.mockImplementation(() => {
      throw new Error('The package is not linked');
    });

    await expect(openCheckout(order)).resolves.toEqual({ status: 'failed', message: 'The package is not linked' });
    expect(service.removeCallback).toHaveBeenCalledTimes(1);
  });
});
