import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../../../../components/Icon/Icon';
import { LabStatusBadge } from '../../../../components/LabStatusBadge/LabStatusBadge';
import { colors } from '../../../../theme';
import { formatWhen } from '../../../../utils/dateFormat';
import type { LabBookingListItem } from '../../types/labBooking.types';
import { styles } from '../../../appointments/components/AppointmentCard/styles/AppointmentCard.styles';
import { labCardStyles } from './styles/LabBookingCard.styles';

interface LabBookingCardProps {
  booking: LabBookingListItem;
  onPress: () => void;
}

export function LabBookingCard({ booking, onPress }: LabBookingCardProps) {
  const when = formatWhen(booking.scheduledAtUtc);
  const homeCollection = booking.collectionMethod === 'HOME_COLLECTION';
  const method = homeCollection ? 'Home collection' : 'Lab visit';
  const services = booking.serviceNames.join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[booking.laboratoryName, services, when, method].filter(Boolean).join(', ')}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.topRow}>
        <View style={labCardStyles.iconTile}>
          <Icon name="flask-outline" size={20} color={colors.accentStrong} />
        </View>
        <View style={styles.identity}>
          <Text style={styles.title} numberOfLines={1}>
            {booking.laboratoryName}
          </Text>
          {services ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {services}
            </Text>
          ) : null}
        </View>
        <LabStatusBadge status={booking.status} />
      </View>
      <View style={styles.facts}>
        <View style={styles.fact}>
          <Icon name="calendar-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.factText} numberOfLines={1}>
            {when}
          </Text>
        </View>
        <View style={styles.fact}>
          <Icon name={homeCollection ? 'home-outline' : 'business-outline'} size={15} color={colors.textSecondary} />
          <Text style={styles.factText} numberOfLines={1}>
            {method}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default LabBookingCard;
