import { useCallback, useEffect, useRef, useState } from 'react';
import { paymentService } from '../../../services/paymentService';
import { openCheckout } from '../cashfree/CashfreeCheckout';
import type { PaymentBookingKind, PaymentQuote } from '../types/payment.types';

const VERIFY_ATTEMPTS = 3;
const VERIFY_DELAY_MS = 1500;

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface UsePaymentArgs {
  kind: PaymentBookingKind;
  bookingId: string;
  onPaid: () => void;
}

export function usePayment({ kind, bookingId, onPaid }: UsePaymentArgs) {
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const unconfirmed = useRef<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadQuote = useCallback(async () => {
    setLoadingQuote(true);
    setLoadError(null);
    try {
      const response = await paymentService.quote(kind, bookingId);
      if (mounted.current) {
        setQuote(response.data);
      }
    } catch (error) {
      if (mounted.current) {
        setLoadError(error instanceof Error ? error.message : 'Could not load the payment summary.');
      }
    } finally {
      if (mounted.current) {
        setLoadingQuote(false);
      }
    }
  }, [kind, bookingId]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  const confirm = useCallback(
    async (paymentId: string): Promise<boolean> => {
      for (let attempt = 0; attempt < VERIFY_ATTEMPTS; attempt += 1) {
        try {
          await paymentService.verify(paymentId);
          unconfirmed.current = null;
          if (mounted.current) {
            setConfirmationPending(false);
            onPaid();
          }
          return true;
        } catch (error) {
          const isLast = attempt === VERIFY_ATTEMPTS - 1;
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (isLast || (statusCode !== undefined && statusCode >= 400 && statusCode < 500)) {
            if (mounted.current) {
              setConfirmationPending(true);
              setPayError(
                error instanceof Error && statusCode !== undefined && statusCode < 500
                  ? error.message
                  : 'We received your payment but could not confirm it yet. Check again in a moment.',
              );
            }
            return false;
          }
          await wait(VERIFY_DELAY_MS);
        }
      }
      return false;
    },
    [onPaid],
  );

  const pay = useCallback(async () => {
    setPaying(true);
    setPayError(null);
    setNotice(null);
    try {
      if (unconfirmed.current) {
        await confirm(unconfirmed.current);
        return;
      }

      const order = await paymentService.createOrder(kind, bookingId);
      const outcome = await openCheckout(order.data);

      if (outcome.status === 'cancelled') {
        setNotice('Payment was cancelled. You can try again whenever you are ready.');
        return;
      }

      if (outcome.status === 'failed') {
        setPayError(outcome.message);
        return;
      }

      unconfirmed.current = order.data.paymentId;
      await confirm(order.data.paymentId);
    } catch (error) {
      setPayError(error instanceof Error ? error.message : 'Could not start the payment. Please try again.');
    } finally {
      if (mounted.current) {
        setPaying(false);
      }
    }
  }, [kind, bookingId, confirm]);

  return { quote, loadingQuote, loadError, loadQuote, paying, payError, notice, confirmationPending, pay };
}
