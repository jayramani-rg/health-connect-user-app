import React, { useCallback, useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EmptyState } from '../../../components/EmptyState/EmptyState';
import { ResultScreen } from '../../../components/ResultScreen/ResultScreen';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { SkeletonList } from '../../../components/SkeletonLoader/SkeletonLoader';
import { labBookingService } from '../../../services/labBookingService';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabBookingDetail } from '../types/labBooking.types';

type Props = NativeStackScreenProps<RootStackParamList, 'LabBookingConfirmation'>;

const LabBookingConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<LabBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await labBookingService.getById(bookingId);
      setBooking(response.data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Could not load your booking.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <ScreenContainer>
        <SkeletonList count={2} />
      </ScreenContainer>
    );
  }

  if (!booking) {
    return (
      <ScreenContainer>
        <EmptyState title="Something went wrong" description={errorText ?? 'Could not load your booking.'} actionLabel="Try again" onActionPress={load} />
      </ScreenContainer>
    );
  }

  const scheduled = new Date(booking.scheduledAtUtc);
  const isHomeCollection = booking.collectionMethod === 'HOME_COLLECTION';

  return (
    <ResultScreen
      tone="pending"
      title="Request sent"
      description={`Your ${isHomeCollection ? 'home collection' : 'lab visit'} request has been sent to ${booking.laboratoryName} for ${scheduled.toLocaleDateString(
        undefined,
        { day: 'numeric', month: 'short' },
      )} at ${scheduled.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}. You'll be notified once they respond.`}
      primaryLabel="Track this booking"
      onPrimaryPress={() => navigation.replace('LabBookingDetail', { bookingId })}
      secondaryLabel="Back to home"
      onSecondaryPress={() => navigation.navigate('MainTabs')}
    />
  );
};

export default LabBookingConfirmationScreen;
