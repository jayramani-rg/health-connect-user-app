import { CFPaymentGatewayService } from 'react-native-cashfree-pg-sdk';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import type { CheckoutOutcome, PaymentOrder } from '../types/payment.types';
import { classifyCheckoutError } from '../utils/checkoutError';

export function openCheckout(order: PaymentOrder): Promise<CheckoutOutcome> {
  return new Promise(resolve => {
    let settled = false;

    const finish = (outcome: CheckoutOutcome) => {
      if (settled) {
        return;
      }
      settled = true;
      CFPaymentGatewayService.removeCallback();
      resolve(outcome);
    };

    try {
      CFPaymentGatewayService.setCallback({
        onVerify: () => finish({ status: 'completed' }),
        onError: error => finish(classifyCheckoutError(error)),
      });

      const environment = order.environment === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
      CFPaymentGatewayService.doWebPayment(new CFSession(order.paymentSessionId, order.cashfreeOrderId, environment));
    } catch (error) {
      finish(classifyCheckoutError(error));
    }
  });
}
