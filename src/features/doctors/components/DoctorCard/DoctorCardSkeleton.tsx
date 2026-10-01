import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../../../../components/SkeletonLoader/SkeletonLoader';
import { radius, spacing } from '../../../../theme';
import { styles } from './styles/DoctorCard.styles';

/** Same card box and row geometry as DoctorCard (it reuses DoctorCard's own styles) so the list doesn't jump
 * when real rows replace the placeholders: avatar · name · specialization · mode chips · fee + locality. */
export function DoctorCardSkeleton() {
  return (
    <View style={styles.card} accessibilityLabel="Loading doctor">
      <SkeletonBlock width={56} height={56} radius={28} />
      <View style={[styles.info, { gap: spacing.xs + 2 }]}>
        <SkeletonBlock width="62%" height={15} />
        <SkeletonBlock width="44%" height={12} />
        <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
          <SkeletonBlock width={62} height={18} radius={radius.pill} />
          <SkeletonBlock width={48} height={18} radius={radius.pill} />
        </View>
        <View style={styles.footerRow}>
          <SkeletonBlock width="30%" height={14} />
          <SkeletonBlock width="34%" height={12} />
        </View>
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
