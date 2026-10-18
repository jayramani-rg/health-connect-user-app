import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Icon } from '../../../../components/Icon/Icon';
import type { IoniconsIconName } from '../../../../components/Icon/Icon';
import { colors } from '../../../../theme';
import { useRemoteImage } from '../../../../utils/media';
import { formatFee, formatNextAvailable, joinArea } from '../../../../utils/providerFormat';
import type { LabListItem } from '../../types/lab.types';
import { styles } from './styles/LabCard.styles';

interface LabCardProps {
  lab: LabListItem;
  onPress: () => void;
  serviceNoun?: string;
}

type DetailTone = 'neutral' | 'good' | 'warn' | 'off';

interface OptionProps {
  icon: IoniconsIconName;
  title: string;
  detail: string | null;
  tone: DetailTone;
  off?: boolean;
}

function CollectionOption({ icon, title, detail, tone, off }: OptionProps) {
  return (
    <View style={[styles.option, off && styles.optionOff]}>
      <View style={styles.optionHeader}>
        <Icon name={icon} size={15} color={off ? colors.textTertiary : colors.brand} />
        <Text style={[styles.optionTitle, off && styles.optionTitleOff]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {detail ? (
        <Text
          style={[
            styles.optionDetail,
            tone === 'good' && styles.optionDetailGood,
            tone === 'warn' && styles.optionDetailWarn,
            tone === 'off' && styles.optionDetailOff,
          ]}
          numberOfLines={2}
        >
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

function LabLogo({ photoUrl }: { photoUrl: string | null }) {
  const image = useRemoteImage(photoUrl);
  return (
    <View style={styles.logo}>
      {image.showImage && image.uri ? (
        <Image
          source={{ uri: image.uri }}
          style={styles.logoImage}
          resizeMode="cover"
          onError={image.onError}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Icon name="flask-outline" size={24} color={colors.brand} />
      )}
    </View>
  );
}

export function LabCard({ lab, onPress, serviceNoun }: LabCardProps) {
  const area = joinArea(lab.locality, lab.city) || lab.state;
  const nearLabel = lab.localityMatch === 'SAME_LOCALITY' ? 'Near you' : lab.localityMatch === 'SAME_CITY' ? 'In your city' : null;
  const paused = lab.isAcceptingBookings === false;
  const noun = serviceNoun ?? (lab.serviceCount === 1 ? 'test or package' : 'tests and packages');

  let visitDetail: string | null = null;
  let visitTone: DetailTone = 'neutral';
  if (paused) {
    visitDetail = 'Not taking bookings';
    visitTone = 'off';
  } else if (lab.nextLabVisitAtUtc) {
    visitDetail = `Next slot ${formatNextAvailable(lab.nextLabVisitAtUtc)}`;
    visitTone = 'good';
  } else if (lab.nextLabVisitAtUtc === null && lab.isAcceptingBookings) {
    visitDetail = 'No slots in the next 7 days';
    visitTone = 'warn';
  }

  let homeDetail: string;
  let homeTone: DetailTone = 'neutral';
  if (!lab.homeCollectionEnabled) {
    homeDetail = 'Not offered';
    homeTone = 'off';
  } else if (lab.homeCollectionAvailableAtPincode === true) {
    homeDetail = 'Available at your address';
    homeTone = 'good';
  } else if (lab.homeCollectionAvailableAtPincode === false) {
    homeDetail = 'Not available at your pincode';
    homeTone = 'warn';
  } else {
    homeDetail = 'Sample pickup from home';
  }

  const accessibilityLabel = [
    lab.name,
    'verified laboratory',
    area,
    nearLabel,
    `${lab.serviceCount} ${noun}`,
    `Lab visit: ${visitDetail ?? 'available'}`,
    `Home collection: ${homeDetail}`,
    lab.startingPrice != null ? `Tests from ${formatFee(lab.startingPrice)}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens the lab's tests and booking options"
    >
      <View style={styles.top}>
        <LabLogo photoUrl={lab.photoUrl} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {lab.name}
            </Text>
            <Icon name="shield-checkmark" size={16} color={colors.brand} />
          </View>
          <View style={styles.areaRow}>
            <Icon name="location-outline" size={13} color={colors.textTertiary} />
            <Text style={styles.areaText} numberOfLines={1}>
              {area}
            </Text>
            {nearLabel ? <Text style={styles.nearText}>· {nearLabel}</Text> : null}
          </View>
          <Text style={styles.serviceText}>
            {lab.serviceCount} {noun}
          </Text>
        </View>
      </View>

      <View style={styles.options}>
        <CollectionOption icon="business-outline" title="Lab visit" detail={visitDetail} tone={visitTone} off={paused} />
        <CollectionOption icon="home-outline" title="Home collection" detail={homeDetail} tone={homeTone} off={!lab.homeCollectionEnabled || paused} />
      </View>

      <View style={styles.footer}>
        {paused ? (
          <Text style={styles.pausedText}>Bookings paused by the lab</Text>
        ) : lab.startingPrice != null ? (
          <View>
            <Text style={styles.priceLabel}>Tests from</Text>
            <Text style={styles.priceValue}>{formatFee(lab.startingPrice)}</Text>
          </View>
        ) : (
          <View />
        )}
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`View tests at ${lab.name}`}
        >
          <Text style={styles.actionText}>View tests</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
