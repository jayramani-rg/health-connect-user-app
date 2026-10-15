import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../../../../components/SkeletonLoader/SkeletonLoader';
import { radius } from '../../../../theme';
import { PHOTO_SIZE, styles } from './styles/DoctorCard.styles';

export function DoctorCardSkeleton() {
  return (
    <View style={styles.card} accessibilityLabel="Loading doctor">
      <View style={styles.top}>
        <SkeletonBlock width={PHOTO_SIZE} height={PHOTO_SIZE} radius={radius.md} />
        <View style={styles.skeletonLines}>
          <SkeletonBlock width="64%" height={16} />
          <SkeletonBlock width="46%" height={12} />
          <SkeletonBlock width="54%" height={12} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={34} radius={radius.md} />
      <View style={styles.footer}>
        <SkeletonBlock width={90} height={30} />
        <SkeletonBlock width={104} height={44} radius={radius.pill} />
      </View>
    </View>
  );
}

export function DoctorListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <DoctorCardSkeleton key={index} />
      ))}
    </View>
  );
}
