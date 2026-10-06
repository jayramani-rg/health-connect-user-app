import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Banner } from '../../../components/Banner/Banner';
import { Button } from '../../../components/Button/Button';
import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import type { RootStackParamList } from '../../../navigation/types';
import { usePayment } from '../hooks/usePayment';
import { styles } from '../styles/PaymentSummaryScreen.styles';
import { formatRupees } from '../utils/paymentFormat';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSummary'>;

const PaymentSummaryScreen: React.FC<Props> = ({ route, navigation }) => {
  const { kind, bookingId } = route.params;

  const handlePaid = useCallback(() => {
    if (kind === 'APPOINTMENT') {
      navigation.replace('AppointmentConfirmation', { appointmentId: bookingId });
    } else {
      navigation.replace('LabBookingConfirmation', { bookingId });
    }
  }, [kind, bookingId, navigation]);

  const { quote, loadingQuote, loadError, loadQuote, paying, payError, notice, confirmationPending, pay } = usePayment({
    kind,
    bookingId,
    onPaid: handlePaid,
  });

  function viewBooking() {
    if (kind === 'APPOINTMENT') {
      navigation.replace('AppointmentDetail', { appointmentId: bookingId });
    } else {
      navigation.replace('LabBookingDetail', { bookingId });
    }
  }

  if (loadingQuote) {
    return (
      <ScreenContainer>
        <SkeletonList count={2} />
      </ScreenContainer>
    );
  }

  if (!quote) {
    return (
      <ScreenContainer>
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

  return (
    <ScreenContainer>
      <Text style={styles.heading}>Payment summary</Text>
      <Text style={styles.subheading}>Pay to send your request. {quote.providerName} sees it as soon as your payment is confirmed.</Text>

      {payError && <Banner variant="error" message={payError} />}
      {notice && <Banner variant="info" message={notice} />}

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
        Complete the payment within {quote.paymentWindowMinutes} minutes or this booking is released. If the provider cannot take it, you are refunded automatically.
      </Text>

      <View style={styles.actions}>
        <Button
          label={confirmationPending ? 'Check payment status' : `Pay ${formatRupees(quote.customerPayableAmount)}`}
          loading={paying}
          onPress={pay}
        />
        <Button label="View booking" variant="ghost" disabled={paying} onPress={viewBooking} />
      </View>
    </ScreenContainer>
  );
};

export default PaymentSummaryScreen;
