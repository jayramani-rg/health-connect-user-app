import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { Icon } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import type { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme';
import { useCountdown } from '../../appointments/hooks/useCountdown';
import { clockSkewMs, formatCountdown } from '../../appointments/utils/slotState';
import { usePayment } from '../hooks/usePayment';
import { useReservationHold } from '../hooks/useReservationHold';
import { styles } from '../styles/PaymentSummaryScreen.styles';
import { formatRupees } from '../utils/paymentFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSummary'>;

const EXPIRING_SOON_MS = 2 * 60 * 1000;

const PaymentSummaryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { kind, bookingId } = route.params;
  const hold = useReservationHold(kind, bookingId);
  const [ended, setEnded] = useState<{ title: string; body: string } | null>(null);
  const [holdNotice, setHoldNotice] = useState<string | null>(null);
  const [quoteSkew, setQuoteSkew] = useState(0);

  const handlePaid = useCallback(() => {
    if (kind === 'APPOINTMENT') {
      navigation.replace('AppointmentConfirmation', { appointmentId: bookingId });
    } else {
      navigation.replace('LabBookingConfirmation', { bookingId });
    }
  }, [kind, bookingId, navigation]);

  const { release, refresh: refreshHold } = hold;
  const handleCheckoutEnded = useCallback(
    async (status: 'cancelled' | 'failed') => {
      if (kind !== 'APPOINTMENT') {
        if (status === 'cancelled') setHoldNotice('Payment was cancelled. You can try again whenever you are ready.');
        return;
      }

      if (status === 'failed') {
        setHoldNotice('You can try again now. After a failed payment the slot stays reserved for only a couple of minutes.');
        refreshHold();
        return;
      }

      const result = await release('CHECKOUT_CANCELLED');
      if (result.outcome === 'confirmed') {
        handlePaid();
      } else if (result.outcome === 'released') {
        setEnded({ title: 'Payment cancelled', body: 'We released the slot so another patient can book it. You can pick a new time whenever you like.' });
      } else {
        setHoldNotice(result.message ?? 'Your slot is still held. You can try paying again.');
      }
    },
    [kind, release, refreshHold, handlePaid],
  );

  const { quote, loadingQuote, loadError, loadQuote, paying, payError, notice, confirmationPending, pay } = usePayment({
    kind,
    bookingId,
    onPaid: handlePaid,
    onCheckoutEnded: handleCheckoutEnded,
  });

  useEffect(() => {
    if (quote?.serverTimeUtc) setQuoteSkew(clockSkewMs(quote.serverTimeUtc, Date.now()));
  }, [quote]);

  const request = hold.request;
  const expiresAt = request?.reservationExpiresAtUtc ?? quote?.reservationExpiresAtUtc ?? null;
  const remaining = useCountdown(kind === 'APPOINTMENT' ? expiresAt : null, request ? hold.skewMs : quoteSkew);

  useEffect(() => {
    if (request?.status === 'CONFIRMED') handlePaid();
  }, [request?.status, handlePaid]);

  const serverEnded = request && (request.status === 'RELEASED' || request.status === 'CLOSED');
  const lapsed = remaining === 0 && !paying && !confirmationPending;
  const terminal = ended ?? (serverEnded || lapsed
    ? { title: 'Reservation expired', body: 'Payment was not completed in time, so the slot was released. If any amount was debited, it is refunded automatically.' }
    : null);

  function viewBooking() {
    if (kind === 'APPOINTMENT') {
      navigation.replace('AppointmentDetail', { appointmentId: bookingId });
    } else {
      navigation.replace('LabBookingDetail', { bookingId });
    }
  }

  function chooseAnotherTime() {
    if (request) {
      navigation.popTo('BookAppointment', { doctorProfileId: request.doctorProfileId, consultationType: request.consultationType });
    } else {
      navigation.goBack();
    }
  }

  if (loadingQuote) {
    return (
      <ScreenContainer variant="page">
        <SkeletonList count={2} />
      </ScreenContainer>
    );
  }

  if (terminal && kind === 'APPOINTMENT') {
    return (
      <ScreenContainer variant="page">
        <EmptyState title={terminal.title} description={terminal.body} actionLabel="Choose another time" onActionPress={chooseAnotherTime} />
        <View style={styles.actions}>
          <Button label="View booking" variant="ghost" onPress={viewBooking} />
        </View>
      </ScreenContainer>
    );
  }

  if (!quote) {
    return (
      <ScreenContainer variant="page">
        <EmptyState
          title="Payment unavailable"
          description={loadError ?? 'This booking is not waiting for payment.'}
          actionLabel="Try again"
          onActionPress={loadQuote}
        />
        <View style={styles.actions}>
          <Button label="View booking" variant="secondary" onPress={viewBooking} />
        </View>
      </ScreenContainer>
    );
  }

  const expiringSoon = remaining !== null && remaining <= EXPIRING_SOON_MS;

  return (
    <ScreenContainer variant="page">
      <Text style={styles.heading}>Payment summary</Text>
      <Text style={styles.subheading}>Pay to send your request. {quote.providerName} sees it as soon as your payment is confirmed.</Text>

      {remaining !== null ? (
        <View style={[styles.hold, expiringSoon && styles.holdWarning]} accessibilityLiveRegion="polite">
          <Icon name="time-outline" size={18} color={expiringSoon ? colors.warning : colors.brand} />
          <View style={styles.holdText}>
            <Text style={styles.holdTitle}>{expiringSoon ? 'Your reservation is expiring soon' : 'Slot reserved for you'}</Text>
            <Text style={styles.holdBody}>Complete payment within {formatCountdown(remaining)} to keep it.</Text>
          </View>
        </View>
      ) : null}

      {payError && <Banner variant="error" message={payError} />}
      {(holdNotice ?? notice) && <Banner variant="info" message={(holdNotice ?? notice)!} />}

      <View style={styles.card}>
        <Text style={styles.bookingTitle}>{quote.title}</Text>
        <Text style={styles.bookingProvider}>{quote.providerName}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Service fee</Text>
          <Text style={styles.value}>{formatRupees(quote.serviceAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Platform fee</Text>
          <Text style={styles.value}>{formatRupees(quote.platformFeeAmount)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatRupees(quote.customerPayableAmount)}</Text>
        </View>
      </View>

      <Text style={styles.hint}>
        {remaining !== null
          ? 'If you cancel checkout, the slot is released for the next patient. If the provider cannot take the booking, you are refunded automatically.'
          : `Complete the payment within ${quote.paymentWindowMinutes} minutes or this booking is released. If the provider cannot take it, you are refunded automatically.`}
      </Text>

      <View style={styles.actions}>
        <Button
          label={confirmationPending ? 'Check payment status' : `Pay ${formatRupees(quote.customerPayableAmount)}`}
          loading={paying || hold.releasing}
          disabled={remaining === 0}
          onPress={() => {
            setHoldNotice(null);
            pay();
          }}
        />
        {kind === 'APPOINTMENT' && request?.status === 'RESERVED' && !confirmationPending ? (
          <Button
            label="Release this slot"
            variant="ghost"
            disabled={paying || hold.releasing}
            onPress={() => handleCheckoutEnded('cancelled')}
          />
        ) : (
          <Button label="View booking" variant="ghost" disabled={paying} onPress={viewBooking} />
        )}
      </View>
    </ScreenContainer>
  );
};

export default PaymentSummaryScreen;
