import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ResultScreen } from '../../../components/ResultScreen/ResultScreen';
import { colors } from '../../../theme';
import { labBookingService } from '../../../services/labBookingService';
import type { RootStackParamList } from '../../../navigation/types';
import type { LabBookingDetail } from '../types/labBooking.types';

type Props = NativeStackScreenProps<RootStackParamList, 'LabBookingConfirmation'>;

const LabBookingConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<LabBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await labBookingService.getById(bookingId);
        if (active) setBooking(response.data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [bookingId]);

  if (loading || !booking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brand} />
      </View>
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
