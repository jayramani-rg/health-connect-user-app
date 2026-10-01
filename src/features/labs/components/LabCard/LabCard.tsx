import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '../../../../components/Icon/Icon';
import { activeopacity } from '../../../../utils/helpers';
import { colors, radius } from '../../../../theme';
import { ASSETS_BASE_URL } from '../../../../config/env';
import type { LabListItem } from '../../types/lab.types';
import { styles } from './styles/LabCard.styles';

export function LabCard({ lab, onPress }: { lab: LabListItem; onPress: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!lab.photoUrl && !imageFailed;

  const area = [lab.locality, lab.city].filter(Boolean).join(', ') || lab.state;
  const nearLabel = lab.localityMatch === 'SAME_LOCALITY' ? 'Near you' : lab.localityMatch === 'SAME_CITY' ? 'In your city' : null;

  return (
    <TouchableOpacity activeOpacity={activeopacity} style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        {showImage ? (
          <Image
            source={{ uri: `${ASSETS_BASE_URL}${lab.photoUrl}` }}
            style={{ width: '100%', height: '100%', borderRadius: radius.md }}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Icon name="flask" size={24} color={colors.brand} />
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {lab.name}
          </Text>
          {nearLabel && (
            <View style={[styles.nearBadge, lab.localityMatch === 'SAME_CITY' && styles.nearBadgeCity]}>
              <Icon name="navigate" size={10} color={lab.localityMatch === 'SAME_LOCALITY' ? colors.white : colors.primary} />
              <Text style={[styles.nearBadgeText, lab.localityMatch === 'SAME_CITY' && styles.nearBadgeTextCity]}>{nearLabel}</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {area} · {lab.serviceCount} service{lab.serviceCount === 1 ? '' : 's'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>Lab visit</Text>
          {lab.homeCollectionEnabled &&
            (lab.homeCollectionAvailableAtPincode ? (
              <Text style={styles.servesChip}>Home collection at your pincode</Text>
            ) : (
              <Text style={styles.metaChip}>Home collection</Text>
            ))}
        </View>
        {!lab.isAcceptingBookings && <Text style={styles.pausedText}>Not accepting bookings</Text>}
      </View>
    </TouchableOpacity>
  );
}
