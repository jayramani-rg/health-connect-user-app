import React from 'react';
import { View } from 'react-native';
import { SkeletonBlock } from '../../../../components/SkeletonLoader/SkeletonLoader';
import { radius, spacing } from '../../../../theme';
import { styles } from './styles/LabCard.styles';

/** Mirrors LabCard's box and rows (shared styles): logo · name · area + service count · collection chips. */
export function LabCardSkeleton() {
  return (
    <View style={styles.card} accessibilityLabel="Loading laboratory">
      <SkeletonBlock width={56} height={56} radius={radius.md} />
      <View style={[styles.info, { gap: spacing.xs + 2 }]}>
        <SkeletonBlock width="58%" height={15} />
        <SkeletonBlock width="72%" height={12} />
        <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
          <SkeletonBlock width={58} height={18} radius={radius.pill} />
          <SkeletonBlock width={104} height={18} radius={radius.pill} />
        </View>
      </View>
    </View>
  );
}

export function LabListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <LabCardSkeleton key={index} />
      ))}
    </View>
  );
}
